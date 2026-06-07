package com.empresa.sistema.dto.eventos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteEvent {
    private String tipo; // CLIENTE_CREADO, CLIENTE_ACTUALIZADO, CLIENTE_ELIMINADO
    private String clienteId;
    private String cedula;
    private String nombreCompleto;
    private LocalDateTime timestamp;
}