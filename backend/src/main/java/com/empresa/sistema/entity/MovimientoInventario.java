package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad; // Positivo para ingresos, negativo para bajas

    @Column(nullable = false, length = 20)
    private String tipo; // INGRESO, BAJA, VENTA, TRASLADO

    @Column(length = 500)
    private String motivo;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private String username;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
