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
public class AlertaStockEvent {
    @Builder.Default
    private String tipo = "ALERTA_STOCK";
    private String productoId;
    private String productoNombre;
    private String sucursalId;
    private int stockActual;
    private String nivelAlerta;
    private LocalDateTime timestamp;
}
