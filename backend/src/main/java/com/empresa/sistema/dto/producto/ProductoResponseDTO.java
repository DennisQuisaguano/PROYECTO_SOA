package com.empresa.sistema.dto.producto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoResponseDTO {
    private String id;
    private String nombre;
    private String descripcion;
    private BigDecimal costoUnitario;
    private BigDecimal precioVenta;
    private Boolean activo;
    private String categoriaId;
    private String categoriaNombre;
}