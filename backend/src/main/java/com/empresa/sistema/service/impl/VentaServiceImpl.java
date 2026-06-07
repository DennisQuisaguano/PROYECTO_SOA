package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.eventos.AlertaStockEvent;
import com.empresa.sistema.dto.eventos.VentaEvent;
import com.empresa.sistema.dto.eventos.StockUpdateEvent;
import com.empresa.sistema.dto.venta.DetalleVentaItemDTO;
import com.empresa.sistema.dto.venta.VentaRequestDTO;
import com.empresa.sistema.dto.venta.VentaResponseDTO;
import com.empresa.sistema.entity.*;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.mapper.VentaMapper;
import com.empresa.sistema.repository.*;
import com.empresa.sistema.service.InventarioService;
import com.empresa.sistema.service.VentaService;
import com.empresa.sistema.util.IvaCalculator;
import com.empresa.sistema.util.NumeroFacturaUtil;
import com.empresa.sistema.util.PdfGenerator;
import com.empresa.sistema.util.SecurityHelper;
import com.empresa.sistema.util.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final SucursalRepository sucursalRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final InventarioService inventarioService;
    private final VentaMapper ventaMapper;
    private final IvaCalculator ivaCalculator;
    private final NumeroFacturaUtil numeroFacturaUtil;
    private final PdfGenerator pdfGenerator;
    private final WebSocketEventPublisher eventPublisher;
    private final SecurityHelper securityHelper;

    @Override
    @Transactional
    public VentaResponseDTO create(VentaRequestDTO dto) {
        // Obtener usuario autenticado desde SecurityHelper
        Usuario usuarioAutenticado = securityHelper.getCurrentUsuario();

        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        // Priorizar la sucursal del DTO (la seleccionada por el usuario al entrar)
        String sucursalId = dto.getSucursalId();
        Usuario cajero = usuarioAutenticado;

        // Si no viene sucursal en el DTO, intentar usar la asignada al usuario
        if (sucursalId == null || sucursalId.isEmpty()) {
            if (usuarioAutenticado.getSucursal() != null) {
                sucursalId = usuarioAutenticado.getSucursal().getId();
            } else if (!usuarioAutenticado.getRol().getNombre().equals("ADMIN")) {
                throw new ValidacionException("Debe especificar una sucursal para realizar la venta");
            }
        }

        if (sucursalId == null || sucursalId.isEmpty()) {
            throw new ValidacionException("Sucursal no especificada");
        }

        // Si es ADMIN, puede registrar para otro cajero si se especifica
        if (usuarioAutenticado.getRol().getNombre().equals("ADMIN")) {
            if (dto.getCajeroId() != null && !dto.getCajeroId().isEmpty()) {
                cajero = securityHelper.findById(dto.getCajeroId())
                        .orElse(usuarioAutenticado);
            }
        }

        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));

        Venta venta = Venta.builder()
                .cliente(cliente)
                .sucursal(sucursal)
                .cajero(cajero)
                .estado(EstadoVenta.COMPLETADA)
                .detalles(new ArrayList<>())
                .build();

        BigDecimal subtotalVenta = BigDecimal.ZERO;

        for (DetalleVentaItemDTO item : dto.getDetalles()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.getProductoId()));
            
            inventarioService.verificarYDescontarStock(producto.getId(), sucursal.getId(), item.getCantidad());

            BigDecimal subtotalLinea = producto.getPrecioVenta().multiply(new BigDecimal(item.getCantidad()));
            subtotalVenta = subtotalVenta.add(subtotalLinea);

            DetalleVenta detalle = DetalleVenta.builder()
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecioVenta())
                    .subtotal(subtotalLinea)
                    .build();

            venta.addDetalle(detalle);
        }

        BigDecimal ivaMonto = ivaCalculator.calcularIva(subtotalVenta);
        BigDecimal total = subtotalVenta.add(ivaMonto);

        venta.setSubtotal(subtotalVenta);
        venta.setIva(ivaMonto);
        venta.setTotal(total);
        
        venta.setNumFac(numeroFacturaUtil.generateNumero(sucursal.getId()));

        Venta ventaGuardada = ventaRepository.save(venta);

        // Emitir eventos WebSocket post-persist y registrar en historial
        for (DetalleVenta dv : ventaGuardada.getDetalles()) {
            int stockNuevo = inventarioRepository.findBySucursalIdAndProductoId(sucursal.getId(), dv.getProducto().getId())
                    .map(Inventario::getStock)
                    .orElse(0);
            int stockAnterior = stockNuevo + dv.getCantidad();

            // Registrar en historial (Kardex) para el bodeguero
            movimientoRepository.save(com.empresa.sistema.entity.MovimientoInventario.builder()
                    .sucursal(sucursal)
                    .producto(dv.getProducto())
                    .cantidad(dv.getCantidad()) // Valor absoluto
                    .tipo("VENTA")
                    .motivo("Factura #" + ventaGuardada.getNumFac())
                    .username(cajero.getUsername())
                    .fecha(LocalDateTime.now())
                    .build());

            StockUpdateEvent stockEvent = StockUpdateEvent.builder()
                    .tipo("STOCK_UPDATE")
                    .productoId(dv.getProducto().getId())
                    .productoNombre(dv.getProducto().getNombre())
                    .sucursalId(sucursal.getId())
                    .stockAnterior(stockAnterior)
                    .stockActual(stockNuevo)
                    .motivoCambio("VENTA")
                    .timestamp(LocalDateTime.now())
                    .build();
            eventPublisher.publicarCambioStock(sucursal.getId(), stockEvent);

            if (stockNuevo == 0) {
                eventPublisher.publicarAlertaStock(sucursal.getId(), AlertaStockEvent.builder()
                        .tipo("ALERTA_STOCK")
                        .productoId(dv.getProducto().getId())
                        .productoNombre(dv.getProducto().getNombre())
                        .sucursalId(sucursal.getId())
                        .stockActual(0)
                        .nivelAlerta("AGOTADO")
                        .timestamp(LocalDateTime.now())
                        .build());
            } else if (stockNuevo < 5) {
                eventPublisher.publicarAlertaStock(sucursal.getId(), AlertaStockEvent.builder()
                        .tipo("ALERTA_STOCK")
                        .productoId(dv.getProducto().getId())
                        .productoNombre(dv.getProducto().getNombre())
                        .sucursalId(sucursal.getId())
                        .stockActual(stockNuevo)
                        .nivelAlerta("CRITICO")
                        .timestamp(LocalDateTime.now())
                        .build());
            } else if (stockNuevo < 10) {
                eventPublisher.publicarAlertaStock(sucursal.getId(), AlertaStockEvent.builder()
                        .tipo("ALERTA_STOCK")
                        .productoId(dv.getProducto().getId())
                        .productoNombre(dv.getProducto().getNombre())
                        .sucursalId(sucursal.getId())
                        .stockActual(stockNuevo)
                        .nivelAlerta("BAJO")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        }

        VentaEvent ventaEvent = VentaEvent.builder()
                .tipo("NUEVA_VENTA")
                .ventaId(ventaGuardada.getId())
                .numFac(ventaGuardada.getNumFac())
                .sucursalId(sucursal.getId())
                .total(ventaGuardada.getTotal())
                .cajeroUsername(cajero.getUsername())
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarNuevaVenta(sucursal.getId(), ventaEvent);

        return ventaMapper.toDto(ventaGuardada);
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponseDTO findById(String id) {
        return ventaRepository.findById(id)
                .map(ventaMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaResponseDTO> findAll(Pageable pageable) {
        return ventaRepository.findAllOrderByFechaDesc(pageable)
                .map(ventaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaResponseDTO> findBySucursalId(String sucursalId, Pageable pageable) {
        return ventaRepository.findBySucursalIdOrderByFechaDesc(sucursalId, pageable)
                .map(ventaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta) {
        return ventaRepository.findByFechaBetween(desde, hasta).stream()
                .map(ventaMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public VentaResponseDTO anularVenta(String id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));

        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new ValidacionException("La venta ya se encuentra anulada");
        }

        venta.setEstado(EstadoVenta.ANULADA);
        Venta ventaGuardada = ventaRepository.save(venta);
        String sucursalId = ventaGuardada.getSucursal().getId();

        for (DetalleVenta detalle : ventaGuardada.getDetalles()) {
            // Usar ajuste interno (sin validación de roles) para revertir el stock al anular
            com.empresa.sistema.dto.inventario.AjusteStockRequestDTO ajuste = new com.empresa.sistema.dto.inventario.AjusteStockRequestDTO();
            ajuste.setSucursalId(sucursalId);
            ajuste.setProductoId(detalle.getProducto().getId());
            ajuste.setCantidad(detalle.getCantidad());
            ajuste.setMotivo("Anulación de Venta " + ventaGuardada.getNumFac());
            inventarioService.realizarAjusteInternoPublico(ajuste);

            int stockNuevo = inventarioRepository.findBySucursalIdAndProductoId(sucursalId, detalle.getProducto().getId())
                    .map(Inventario::getStock)
                    .orElse(0);
            int stockAnterior = stockNuevo - detalle.getCantidad();

            StockUpdateEvent stockEvent = StockUpdateEvent.builder()
                    .tipo("STOCK_UPDATE")
                    .productoId(detalle.getProducto().getId())
                    .productoNombre(detalle.getProducto().getNombre())
                    .sucursalId(sucursalId)
                    .stockAnterior(stockAnterior)
                    .stockActual(stockNuevo)
                    .motivoCambio("ANULACION")
                    .timestamp(LocalDateTime.now())
                    .build();
            eventPublisher.publicarCambioStock(sucursalId, stockEvent);
        }

        VentaEvent ventaEvent = VentaEvent.builder()
                .tipo("VENTA_ANULADA")
                .ventaId(ventaGuardada.getId())
                .numFac(ventaGuardada.getNumFac())
                .sucursalId(sucursalId)
                .total(ventaGuardada.getTotal())
                .cajeroUsername(ventaGuardada.getCajero().getUsername())
                .timestamp(LocalDateTime.now())
                .build();
        eventPublisher.publicarNuevaVenta(sucursalId, ventaEvent);

        return ventaMapper.toDto(ventaGuardada);
    }

    @Override
    public byte[] generarFacturaPdf(String id) {
        VentaResponseDTO venta = findById(id);
        return pdfGenerator.generarFactura(venta);
    }}