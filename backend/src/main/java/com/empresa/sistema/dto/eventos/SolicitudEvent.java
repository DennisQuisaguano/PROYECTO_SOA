package com.empresa.sistema.dto.eventos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudEvent {
    private String tipo; // NUEVA_SOLICITUD, SOLICITUD_APROBADA, SOLICITUD_RECHAZADA
    private String solicitudId;
    private String sucursalSolicitanteId;
    private String sucursalOrigenId;
    private String productoNombre;
    private int cantidadSolicitada;
    private int cantidadAprobada;
    private String estado;
    private LocalDateTime timestamp;
}
