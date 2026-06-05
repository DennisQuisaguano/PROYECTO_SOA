package com.empresa.sistema.dto.venta;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetalleVentaItemDTO {
    @NotBlank(message = "El producto es requerido")
    private String productoId;

    @NotNull(message = "La cantidad es requerida")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;
}