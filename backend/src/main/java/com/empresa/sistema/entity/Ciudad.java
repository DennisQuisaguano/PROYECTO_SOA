package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "ciudades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ciudad {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String provincia;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "CIU" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
    }
}