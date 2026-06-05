package com.empresa.sistema.dto.inventario;

import lombok.Data;

@Data
public class InventarioResponseDTO {
    private String id;
    private String sucursalId;
    private String sucursalNombre;
    private String productoId;
    private String productoNombre;
    private String categoriaId;
    private String categoriaNombre;
    private java.math.BigDecimal precioVenta;
    private Integer stock;
}