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
public class StockUpdateEvent {
    @Builder.Default
    private String tipo = "STOCK_UPDATE";
    private String productoId;
    private String productoNombre;
    private String sucursalId;
    private int stockAnterior;
    private int stockActual;
    private String motivoCambio;
    private LocalDateTime timestamp;
}
