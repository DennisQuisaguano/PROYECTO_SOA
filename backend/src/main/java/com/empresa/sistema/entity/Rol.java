package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rol {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "ROL" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
    }
}