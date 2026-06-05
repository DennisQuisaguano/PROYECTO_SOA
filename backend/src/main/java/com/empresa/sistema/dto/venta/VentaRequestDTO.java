package com.empresa.sistema.dto.venta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class VentaRequestDTO {
    @NotBlank(message = "El cliente es requerido")
    private String clienteId;

    @NotBlank(message = "La sucursal es requerida")
    private String sucursalId;

    @NotBlank(message = "El cajero es requerido")
    private String cajeroId;

    @NotEmpty(message = "Debe incluir al menos un detalle de venta")
    @Valid
    private List<DetalleVentaItemDTO> detalles;
}