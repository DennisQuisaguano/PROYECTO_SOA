package com.empresa.sistema.dto.venta;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponseDTO {
    private String id;
    private String numFac;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private String estado;
    private String clienteId;
    private String clienteNombre;
    private String clienteCedula;
    private String sucursalId;
    private String sucursalNombre;
    private String cajeroId;
    private String cajeroNombre;
    private List<DetalleVentaDTO> detalles;
}