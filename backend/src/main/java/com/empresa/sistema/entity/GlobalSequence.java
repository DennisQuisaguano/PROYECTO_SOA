package com.empresa.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "global_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalSequence {
    @Id
    @Column(length = 10)
    private String prefix;

    @Column(name = "last_value", nullable = false)
    private Long lastValue;
}
