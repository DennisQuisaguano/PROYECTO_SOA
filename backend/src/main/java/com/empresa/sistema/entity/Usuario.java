package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(columnDefinition = "TINYINT(1)")
    @Builder.Default
    private Boolean activo = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = true)
    private Sucursal sucursal;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "USR" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (activo == null) {
            activo = true;
        }
    }
}