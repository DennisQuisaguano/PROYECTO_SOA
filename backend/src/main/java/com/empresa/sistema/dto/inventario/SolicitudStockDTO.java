package com.empresa.sistema.dto.inventario;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SolicitudStockDTO {
    private String id;
    private String sucursalOrigenId;
    private String sucursalOrigenNombre;
    private String sucursalDestinoId;
    private String sucursalDestinoNombre;
    private String productoId;
    private String productoNombre;
    private Integer cantidad;
    private String estado;
    private LocalDateTime fechaCreacion;
}

@Data
class CreateSolicitudDTO {
    private String sucursalOrigenId;
    private String sucursalDestinoId;
    private String productoId;
    private Integer cantidad;
}