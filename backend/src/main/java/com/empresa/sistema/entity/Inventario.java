package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "inventarios", uniqueConstraints = {
    @UniqueConstraint(name = "uk_sucursal_producto", columnNames = {"sucursal_id", "producto_id"})
}, indexes = {
    @Index(name = "idx_inventario_stock", columnList = "stock")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventario {
    @Id
    @Column(length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "INV" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (stock == null) {
            stock = 0;
        }
    }
}