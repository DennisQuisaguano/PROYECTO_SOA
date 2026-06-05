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
public class ProductoEvent {
    private String tipo; // PRODUCTO_CREADO, PRODUCTO_ACTUALIZADO, PRODUCTO_DESACTIVADO
    private String productoId;
    private String productoNombre;
    private String categoriaId;
    private LocalDateTime timestamp;
}
