package com.empresa.sistema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "configuracion_factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionFactura {
    @Id
    @Column(length = 10)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false, unique = true)
    private Sucursal sucursal;

    @Column(name = "ultimo_numero")
    @Builder.Default
    private Integer ultimoNumero = 0;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = "CNF" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
        }
        if (ultimoNumero == null) {
            ultimoNumero = 0;
        }
    }
}