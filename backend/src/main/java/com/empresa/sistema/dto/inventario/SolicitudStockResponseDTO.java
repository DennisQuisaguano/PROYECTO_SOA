package com.empresa.sistema.dto.inventario;

import com.empresa.sistema.entity.EstadoSolicitud;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SolicitudStockResponseDTO {
    private String id;
    private String sucursalOrigenId;
    private String sucursalOrigenNombre;
    private String sucursalDestinoId;
    private String sucursalDestinoNombre;
    private String productoId;
    private String productoNombre;
    private Integer cantidad;
    private EstadoSolicitud estado;
    private LocalDateTime fechaCreacion;
}