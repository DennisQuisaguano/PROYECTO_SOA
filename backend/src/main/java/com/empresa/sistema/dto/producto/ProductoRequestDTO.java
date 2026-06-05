package com.empresa.sistema.dto.producto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoRequestDTO {
    @NotBlank(message = "El nombre es requerido")
    @Size(max = 150)
    private String nombre;

    private String descripcion;

    @NotNull(message = "El costo unitario es requerido")
    @DecimalMin(value = "0.01", message = "El costo debe ser mayor a 0")
    private BigDecimal costoUnitario;

    @NotNull(message = "El precio de venta es requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioVenta;

    @NotBlank(message = "La categoría es requerida")
    private String categoriaId;

    private Integer stockInicial;
    private String sucursalId;
}