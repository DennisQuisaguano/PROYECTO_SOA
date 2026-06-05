package com.empresa.sistema.dto.inventario;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MovimientoInventarioResponseDTO {
    private String id;
    private String sucursalNombre;
    private String productoNombre;
    private Integer cantidad;
    private String tipo;
    private String motivo;
    private LocalDateTime fecha;
    private String username;
}
