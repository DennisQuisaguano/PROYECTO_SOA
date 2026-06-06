package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.eventos.AlertaStockEvent;
import com.empresa.sistema.dto.eventos.StockUpdateEvent;
import com.empresa.sistema.dto.inventario.AjusteStockRequestDTO;
import com.empresa.sistema.dto.inventario.InventarioResponseDTO;
import com.empresa.sistema.entity.Inventario;
import com.empresa.sistema.entity.MovimientoInventario;
import com.empresa.sistema.entity.Producto;
import com.empresa.sistema.entity.Sucursal;
import com.empresa.sistema.entity.Usuario;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.StockInsuficienteException;
import com.empresa.sistema.mapper.InventarioMapper;
import com.empresa.sistema.mapper.MovimientoInventarioMapper;
import com.empresa.sistema.repository.InventarioRepository;
import com.empresa.sistema.repository.MovimientoInventarioRepository;
import com.empresa.sistema.repository.ProductoRepository;
import com.empresa.sistema.repository.SucursalRepository;
import com.empresa.sistema.repository.UsuarioRepository;
import com.empresa.sistema.service.InventarioService;
import com.empresa.sistema.util.SecurityHelper;
import com.empresa.sistema.util.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepository;
    private final SucursalRepository sucursalRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final InventarioMapper inventarioMapper;
    private final MovimientoInventarioMapper movimientoMapper;
    private final WebSocketEventPublisher eventPublisher;
    private final SecurityHelper securityHelper;
    private final jakarta.servlet.http.HttpServletRequest httpServletRequest;

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> findBySucursalId(String sucursalId) {
        return inventarioRepository.findBySucursalId(sucursalId)
                .stream()
                .map(inventarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> findByProductoId(String productoId) {
        return inventarioRepository.findByProductoId(productoId).stream()
                .map(inventarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> findGlobalStockExcludingSucursal(String productoId, String excludeSucursalId) {
        return inventarioRepository.findByProductoIdAndSucursal_IdNot(productoId, excludeSucursalId).stream()
                .filter(inv -> inv.getStock() > 0)
                .map(inventarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> findDisponiblesBySucursalId(String sucursalId) {
        return inventarioRepository.findBySucursalIdAndStockGreaterThan(sucursalId, 0).stream()
                .map(inventarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void verificarYDescontarStock(String productoId, String sucursalId, Integer cantidad) {
        Inventario inventario = inventarioRepository.findBySucursalIdAndProductoId(sucursalId, productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado para el producto en la sucursal"));

        if (inventario.getStock() < cantidad) {
            throw new StockInsuficienteException("El producto " + inventario.getProducto().getNombre() + 
                    " solo tiene " + inventario.getStock() + " unidades disponibles");
        }
        
        inventario.setStock(inventario.getStock() - cantidad);
        inventarioRepository.save(inventario);
    }

    private String getActiveSucursalId(Usuario usuario) {
        String headerSucursalId = httpServletRequest.getHeader("X-Sucursal-Id");
        if (headerSucursalId != null && !headerSucursalId.isEmpty()) {
            return headerSucursalId;
        }
        return usuario.getSucursal() != null ? usuario.getSucursal().getId() : null;
    }

    @Override
    @Transactional
    public InventarioResponseDTO ajustarStock(AjusteStockRequestDTO dto) {
        // Validación de seguridad
        Usuario usuarioAutenticado = securityHelper.getCurrentUsuario();

        String sucursalIdSolicitada = dto.getSucursalId();
        
        // Regla: Si es BODEGUERO, solo puede ajustar la sucursal que tiene ACTIVA en el sistema
        if (usuarioAutenticado.getRol().getNombre().equals("BODEGUERO")) {
            String activeSucursalId = getActiveSucursalId(usuarioAutenticado);
            if (activeSucursalId == null || !activeSucursalId.equals(sucursalIdSolicitada)) {
                throw new com.empresa.sistema.exception.ValidacionException("Como bodeguero, solo puede ajustar el stock de su sucursal activa.");
            }
        } 
        else if (!usuarioAutenticado.getRol().getNombre().equals("ADMIN")) {
            throw new com.empresa.sistema.exception.ValidacionException("No tiene permisos para realizar ajustes de stock");
        }

        // Buscar inventario existente o inicializar uno nuevo
        Inventario inventario = inventarioRepository.findBySucursalIdAndProductoId(sucursalIdSolicitada, dto.getProductoId())
                .orElseGet(() -> {
                    Sucursal sucursal = sucursalRepository.findById(sucursalIdSolicitada)
                            .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada: " + sucursalIdSolicitada));
                    Producto producto = productoRepository.findById(dto.getProductoId())
                            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + dto.getProductoId()));
                    
                    return Inventario.builder()
                            .id(java.util.UUID.randomUUID().toString()) // Generar ID único si no usa auto-increment
                            .sucursal(sucursal)
                            .producto(producto)
                            .stock(0)
                            .build();
                });

        int stockAnterior = inventario.getStock();
        int nuevoStock = stockAnterior + dto.getCantidad();

        if (nuevoStock < 0) {
            throw new StockInsuficienteException("El ajuste resultaría en stock negativo (" + nuevoStock + ") para " + inventario.getProducto().getNombre());
        }

        inventario.setStock(nuevoStock);
        Inventario guardado = inventarioRepository.save(inventario);
        int stockActual = guardado.getStock();

        // Registrar movimiento en historial (Kardex)
        MovimientoInventario movimiento = MovimientoInventario.builder()
                .sucursal(guardado.getSucursal())
                .producto(guardado.getProducto())
                .cantidad(Math.abs(dto.getCantidad())) // Valor absoluto sin signos
                .tipo(dto.getCantidad() > 0 ? "INGRESO" : "BAJA")
                .motivo(dto.getMotivo())
                .username(securityHelper.getCurrentUsername()) // El usuario autenticado
                .fecha(LocalDateTime.now())
                .build();
        movimientoRepository.save(movimiento);

        // WebSocket events
        StockUpdateEvent stockEvent = StockUpdateEvent.builder()
                .tipo("STOCK_UPDATE")
                .productoId(guardado.getProducto().getId())
                .productoNombre(guardado.getProducto().getNombre())
                .sucursalId(sucursalIdSolicitada)
                .stockAnterior(stockAnterior)
                .stockActual(stockActual)
                .motivoCambio("AJUSTE")
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarCambioStock(sucursalIdSolicitada, stockEvent);

        if (stockActual == 0) {
            eventPublisher.publicarAlertaStock(sucursalIdSolicitada, AlertaStockEvent.builder()
                    .tipo("ALERTA_STOCK")
                    .productoId(guardado.getProducto().getId())
                    .productoNombre(guardado.getProducto().getNombre())
                    .sucursalId(sucursalIdSolicitada)
                    .stockActual(0)
                    .nivelAlerta("AGOTADO")
                    .timestamp(LocalDateTime.now())
                    .build());
        } else if (stockActual < 5) {
            eventPublisher.publicarAlertaStock(sucursalIdSolicitada, AlertaStockEvent.builder()
                    .tipo("ALERTA_STOCK")
                    .productoId(guardado.getProducto().getId())
                    .productoNombre(guardado.getProducto().getNombre())
                    .sucursalId(sucursalIdSolicitada)
                    .stockActual(stockActual)
                    .nivelAlerta("CRITICO")
                    .timestamp(LocalDateTime.now())
                    .build());
        } else if (stockActual < 10) {
            eventPublisher.publicarAlertaStock(sucursalIdSolicitada, AlertaStockEvent.builder()
                    .tipo("ALERTA_STOCK")
                    .productoId(guardado.getProducto().getId())
                    .productoNombre(guardado.getProducto().getNombre())
                    .sucursalId(sucursalIdSolicitada)
                    .stockActual(stockActual)
                    .nivelAlerta("BAJO")
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        return inventarioMapper.toDto(guardado);
    }

    @Override
    @Transactional
    public void transferirStock(String sucursalOrigenId, String sucursalDestinoId, String productoId, Integer cantidad) {
        // Validación de seguridad: Solo BODEGUERO puede transferir directamente.
        Usuario usuarioAutenticado = securityHelper.getCurrentUsuario();

        if (!usuarioAutenticado.getRol().getNombre().equals("BODEGUERO")) {
            throw new com.empresa.sistema.exception.ValidacionException("No tiene permisos para realizar transferencias de stock");
        }
        
        transferirStockInterno(sucursalOrigenId, sucursalDestinoId, productoId, cantidad);
    }

    @Override
    @Transactional
    public void transferirStockInterno(String sucursalOrigenId, String sucursalDestinoId, String productoId, Integer cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad a transferir debe ser mayor a 0");
        }

        String currentUsername = securityHelper.getCurrentUsername();

        verificarYDescontarStock(productoId, sucursalOrigenId, cantidad);

        // Registrar salida de origen en historial
        Sucursal sucursalOrigen = sucursalRepository.findById(sucursalOrigenId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal origen no encontrada: " + sucursalOrigenId));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));

        movimientoRepository.save(MovimientoInventario.builder()
                .sucursal(sucursalOrigen)
                .producto(producto)
                .cantidad(cantidad)
                .tipo("TRASLADO")
                .motivo("Transferencia hacia sucursal " + sucursalDestinoId)
                .username(currentUsername)
                .fecha(LocalDateTime.now())
                .build());

        AjusteStockRequestDTO ajusteDto = new AjusteStockRequestDTO();
        ajusteDto.setSucursalId(sucursalDestinoId);
        ajusteDto.setProductoId(productoId);
        ajusteDto.setCantidad(cantidad);
        ajusteDto.setMotivo("Transferencia desde sucursal " + sucursalOrigenId);
        
        realizarAjusteInternoPublico(ajusteDto);

        // Registrar entrada en destino en historial
        Sucursal sucursalDestino = sucursalRepository.findById(sucursalDestinoId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal destino no encontrada: " + sucursalDestinoId));

        movimientoRepository.save(MovimientoInventario.builder()
                .sucursal(sucursalDestino)
                .producto(producto)
                .cantidad(cantidad)
                .tipo("TRASLADO")
                .motivo("Transferencia desde sucursal " + sucursalOrigenId)
                .username(currentUsername)
                .fecha(LocalDateTime.now())
                .build());
    }

    @Override
    public void realizarAjusteInternoPublico(AjusteStockRequestDTO dto) {
        Inventario inventario = inventarioRepository.findBySucursalIdAndProductoId(dto.getSucursalId(), dto.getProductoId())
                .orElseGet(() -> {
                    Sucursal sucursal = sucursalRepository.findById(dto.getSucursalId())
                            .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));
                    Producto producto = productoRepository.findById(dto.getProductoId())
                            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
                    return Inventario.builder().sucursal(sucursal).producto(producto).stock(0).build();
                });
        int stockAnterior = inventario.getStock();
        int stockNuevo = stockAnterior + dto.getCantidad();
        inventario.setStock(stockNuevo);
        Inventario guardado = inventarioRepository.save(inventario);

        // Publicar evento WebSocket para la sucursal destino
        StockUpdateEvent stockEvent = StockUpdateEvent.builder()
                .tipo("STOCK_UPDATE")
                .productoId(guardado.getProducto().getId())
                .productoNombre(guardado.getProducto().getNombre())
                .sucursalId(dto.getSucursalId())
                .stockAnterior(stockAnterior)
                .stockActual(stockNuevo)
                .motivoCambio("TRASLADO")
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarCambioStock(dto.getSucursalId(), stockEvent);
    }
}