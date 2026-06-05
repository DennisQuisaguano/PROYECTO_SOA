package com.empresa.sistema.dto.venta;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleVentaDTO {
    private String id;
    private String productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}