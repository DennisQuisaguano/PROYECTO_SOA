package com.empresa.sistema.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String username;
    private String rol;
    private String sucursalId;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
}