package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "CAT" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
    }
}