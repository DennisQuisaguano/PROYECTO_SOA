package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {
    @Id
    @Column(length = 10)
    private String id;

    @Column(name = "num_fac", nullable = false, unique = true, length = 20)
    private String numFac;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal iva;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVenta estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cajero_id", nullable = false)
    private Usuario cajero;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DetalleVenta> detalles = new ArrayList<>();

    public void addDetalle(DetalleVenta detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }

    public void removeDetalle(DetalleVenta detalle) {
        detalles.remove(detalle);
        detalle.setVenta(null);
    }

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "VEN" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}