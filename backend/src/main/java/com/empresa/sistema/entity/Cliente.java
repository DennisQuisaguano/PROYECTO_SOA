package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, unique = true, length = 10)
    private String cedula;

    @Column(name = "nombre_uno", nullable = false, length = 50)
    private String nombreUno;

    @Column(name = "nombre_dos", length = 50)
    private String nombreDos;

    @Column(name = "apellido_paterno", nullable = false, length = 50)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", length = 50)
    private String apellidoMaterno;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "CLI" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
    }
}