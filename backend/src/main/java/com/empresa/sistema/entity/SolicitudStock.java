package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "solicitudes_stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudStock {
    @Id
    @Column(length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_origen_id", nullable = false)
    private Sucursal sucursalOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_destino_id", nullable = false)
    private Sucursal sucursalDestino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private String motivo;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "SOL" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE;
        }
    }
}