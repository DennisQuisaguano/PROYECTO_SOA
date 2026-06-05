package com.empresa.sistema.dto.eventos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaEvent {
    private String tipo; // NUEVA_VENTA or VENTA_ANULADA
    private String ventaId;
    private String numFac;
    private String sucursalId;
    private BigDecimal total;
    private String cajeroUsername;
    private LocalDateTime timestamp;
}
