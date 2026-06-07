package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "productos", indexes = {
    @Index(name = "idx_producto_nombre", columnList = "nombre"),
    @Index(name = "idx_producto_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {
    @Id
    @Column(length = 10)
    private String id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "costo_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(columnDefinition = "TINYINT(1)")
    @Builder.Default
    private Boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "PRD" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (activo == null) {
            activo = true;
        }
    }
}