package com.empresa.sistema.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClienteRequestDTO {
    @NotBlank(message = "La cédula es requerida")
    @Size(min = 10, max = 10, message = "La cédula debe tener 10 dígitos")
    private String cedula;

    @NotBlank(message = "El primer nombre es requerido")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El primer nombre solo puede contener letras, tildes y la letra ñ")
    private String nombreUno;

    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$", message = "El segundo nombre solo puede contener letras, tildes y la letra ñ")
    private String nombreDos;

    @NotBlank(message = "El apellido paterno es requerido")
    @Size(max = 50, message = "El apellido no puede exceder los 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El apellido paterno solo puede contener letras, tildes y la letra ñ")
    private String apellidoPaterno;

    @Size(max = 50, message = "El apellido no puede exceder los 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$", message = "El apellido materno solo puede contener letras, tildes y la letra ñ")
    private String apellidoMaterno;

    @Email(message = "Debe ser un correo válido")
    @NotBlank(message = "El email es requerido")
    private String email;

    @NotBlank(message = "El teléfono es requerido")
    @Pattern(regexp = "^\\d{10}$", message = "El teléfono debe contener exactamente 10 dígitos numéricos")
    private String telefono;

    private String direccion;

    private Boolean activo;
}