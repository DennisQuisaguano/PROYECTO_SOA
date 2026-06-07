package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalConfig {
    @Id
    @Column(length = 50)
    private String id; // e.g., "iva_porcentaje"

    @Column(nullable = false)
    private String valor;
}