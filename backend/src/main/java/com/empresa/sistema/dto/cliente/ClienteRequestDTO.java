package com.empresa.sistema.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClienteRequestDTO {
    @NotBlank(message = "La cédula es requerida")
    @Size(min = 10, max = 10, message = "La cédula debe tener 10 dígitos")
    private String cedula;

    @NotBlank(message = "El primer nombre es requerido")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String nombreUno;

    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String nombreDos;

    @NotBlank(message = "El apellido paterno es requerido")
    @Size(max = 50, message = "El apellido no puede exceder los 50 caracteres")
    private String apellidoPaterno;

    @Size(max = 50, message = "El apellido no puede exceder los 50 caracteres")
    private String apellidoMaterno;

    @Email(message = "Debe ser un correo válido")
    @NotBlank(message = "El email es requerido")
    private String email;

    @NotBlank(message = "El teléfono es requerido")
    @Size(max = 20)
    private String telefono;

    private String direccion;
}