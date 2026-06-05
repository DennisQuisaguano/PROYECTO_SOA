package com.empresa.sistema.dto.cliente;

import lombok.Data;

@Data
public class ClienteResponseDTO {
    private String id;
    private String cedula;
    private String nombreUno;
    private String nombreDos;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String email;
    private String telefono;
    private String direccion;
}