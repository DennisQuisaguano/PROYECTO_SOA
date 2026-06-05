package com.empresa.sistema.dto.inventario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteStockRequestDTO {
    @NotBlank(message = "La sucursal es requerida")
    private String sucursalId;

    @NotBlank(message = "El producto es requerido")
    private String productoId;

    @NotNull(message = "La cantidad es requerida")
    private Integer cantidad;

    @NotBlank(message = "El motivo es requerido")
    private String motivo;
}