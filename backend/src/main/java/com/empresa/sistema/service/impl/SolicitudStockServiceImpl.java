package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.eventos.AlertaStockEvent;
import com.empresa.sistema.dto.eventos.SolicitudEvent;
import com.empresa.sistema.dto.eventos.StockUpdateEvent;
import com.empresa.sistema.dto.inventario.SolicitudStockResponseDTO;
import com.empresa.sistema.entity.*;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.mapper.SolicitudStockMapper;
import com.empresa.sistema.repository.*;
import com.empresa.sistema.service.SolicitudStockService;
import com.empresa.sistema.service.InventarioService;
import com.empresa.sistema.util.SecurityHelper;
import com.empresa.sistema.util.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudStockServiceImpl implements SolicitudStockService {

    private final SolicitudStockRepository repository;
    private final SucursalRepository sucursalRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final InventarioService inventarioService;
    private final SolicitudStockMapper mapper;
    private final WebSocketEventPublisher eventPublisher;
    private final SecurityHelper securityHelper;
    private final jakarta.servlet.http.HttpServletRequest httpServletRequest;

    private String getActiveSucursalId(Usuario usuario) {
        String headerSucursalId = httpServletRequest.getHeader("X-Sucursal-Id");
        if (headerSucursalId != null && !headerSucursalId.isEmpty()) {
            return headerSucursalId;
        }
        return usuario.getSucursal() != null ? usuario.getSucursal().getId() : null;
    }

    private void validarPermisosBodeguero(SolicitudStock sol) {
        Usuario usuario = securityHelper.getCurrentUsuario();
        if (!usuario.getRol().getNombre().equals("BODEGUERO")) {
            throw new AccessDeniedException("No tiene permisos para gestionar solicitudes de stock");
        }
        String activeSucursalId = getActiveSucursalId(usuario);
        if (activeSucursalId == null || !activeSucursalId.equals(sol.getSucursalOrigen().getId())) {
            throw new AccessDeniedException("No tiene permisos para gestionar solicitudes de esta sucursal");
        }
    }

    @Override
    @Transactional
    public SolicitudStockResponseDTO crearSolicitud(String origenId, String destinoId, String productoId, Integer cantidad) {
        if (origenId.equals(destinoId)) {
            throw new ValidacionException("No se puede solicitar stock a la misma sucursal (ID: " + origenId + ")");
        }

        Sucursal origen = sucursalRepository.findById(origenId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal origen no encontrada: " + origenId));
        Sucursal destino = sucursalRepository.findById(destinoId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal destino no encontrada: " + destinoId));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));

        SolicitudStock solicitud = new SolicitudStock();
        solicitud.setSucursalOrigen(origen);
        solicitud.setSucursalDestino(destino);
        solicitud.setProducto(producto);
        solicitud.setCantidad(cantidad);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        
        SolicitudStock guardada = repository.save(solicitud);
        
        // WebSocket Event
        SolicitudEvent event = SolicitudEvent.builder()
                .tipo("NUEVA_SOLICITUD")
                .solicitudId(guardada.getId())
                .sucursalSolicitanteId(destinoId)
                .sucursalOrigenId(origenId)
                .productoNombre(producto.getNombre())
                .cantidadSolicitada(cantidad)
                .cantidadAprobada(0)
                .estado("PENDIENTE")
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarCambioSolicitud(origenId, event);

        return mapper.toDto(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudStockResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void aprobarSolicitud(String id, Integer cantidadAprobada) {
        SolicitudStock sol = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));
        
        validarPermisosBodeguero(sol);

        if (sol.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new ValidacionException("La solicitud ya no está pendiente (Estado actual: " + sol.getEstado() + ")");
        }

        // Si se envió una cantidad específica, usar esa, sino usar la original
        int cantFinal = (cantidadAprobada != null && cantidadAprobada > 0) ? cantidadAprobada : sol.getCantidad();
        
        if (cantFinal > sol.getCantidad()) {
            throw new ValidacionException("No puede aprobar más de la cantidad solicitada (" + sol.getCantidad() + ")");
        }

        // IMPORTANTE: Actualizar la cantidad en la entidad para que el historial y la transferencia usen el valor ajustado
        sol.setCantidad(cantFinal);
        sol.setEstado(EstadoSolicitud.APROBADA);
        repository.save(sol);
        repository.flush(); // Asegurar persistencia inmediata antes de la transferencia

        String origId = sol.getSucursalOrigen().getId();
        String destId = sol.getSucursalDestino().getId();
        String prodId = sol.getProducto().getId();

        // 2. Ejecutar la transferencia de stock interna con la cantidad ajustada (cantFinal)
        inventarioService.transferirStockInterno(origId, destId, prodId, cantFinal);

        // 3. Notificaciones (Se manejan dentro de transferirStockInterno para el historial y stock)
        
        SolicitudEvent approvalEvent = SolicitudEvent.builder()
                .tipo("SOLICITUD_APROBADA")
                .solicitudId(sol.getId())
                .sucursalSolicitanteId(destId)
                .sucursalOrigenId(origId)
                .productoNombre(sol.getProducto().getNombre())
                .cantidadSolicitada(cantFinal)
                .cantidadAprobada(cantFinal)
                .estado("APROBADA")
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarCambioSolicitud(destId, approvalEvent);
        eventPublisher.publicarCambioSolicitud(origId, approvalEvent);
    }

    @Override
    @Transactional
    public void rechazarSolicitud(String id) {
        SolicitudStock sol = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));
        
        // 1. Validaciones previas de seguridad
        validarPermisosBodeguero(sol);

        if (sol.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new ValidacionException("La solicitud ya no está pendiente (Estado actual: " + sol.getEstado() + ")");
        }

        sol.setEstado(EstadoSolicitud.RECHAZADA);
        repository.save(sol);

        // 2. Emitir evento WebSocket
        SolicitudEvent rejectionEvent = SolicitudEvent.builder()
                .tipo("SOLICITUD_RECHAZADA")
                .solicitudId(sol.getId())
                .sucursalSolicitanteId(sol.getSucursalDestino().getId())
                .sucursalOrigenId(sol.getSucursalOrigen().getId())
                .productoNombre(sol.getProducto().getNombre())
                .cantidadSolicitada(sol.getCantidad())
                .cantidadAprobada(0)
                .estado("RECHAZADA")
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarCambioSolicitud(sol.getSucursalDestino().getId(), rejectionEvent);
    }
}
