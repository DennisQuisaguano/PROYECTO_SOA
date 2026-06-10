package com.empresa.sistema.dto.usuario;

import lombok.Data;

@Data
public class UsuarioResponseDTO {
    private String id;
    private String username;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String rolId;
    private String rolNombre;
    private String sucursalId;
    private String sucursalNombre;
    private Boolean activo;
    private String telefono;
}