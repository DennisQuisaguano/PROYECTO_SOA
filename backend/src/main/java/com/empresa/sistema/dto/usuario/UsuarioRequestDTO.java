package com.empresa.sistema.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    @NotBlank(message = "El nombre de usuario es requerido")
    @Size(min = 4, max = 50)
    private String username;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El nombre completo es requerido")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El nombre completo solo puede contener letras, tildes y la letra ñ")
    private String nombreCompleto;

    @NotBlank(message = "El ID del rol es requerido")
    private String rolId;

    private String sucursalId;
    
    private Boolean activo;

    @Pattern(regexp = "^\\d{10}$", message = "El teléfono debe contener exactamente 10 dígitos numéricos")
    private String telefono;
}