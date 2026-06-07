package com.empresa.sistema.util;

import com.empresa.sistema.entity.GlobalSequence;
import com.empresa.sistema.repository.GlobalSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SequenceGenerator {

    private final GlobalSequenceRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String nextId(String prefix) {
        GlobalSequence seq = repository.findById(prefix)
                .orElseGet(() -> GlobalSequence.builder()
                        .prefix(prefix)
                        .lastValue(0L)
                        .build());
        
        Long newValue = seq.getLastValue() + 1;
        seq.setLastValue(newValue);
        repository.save(seq);
        
        // Formato: PREFIX + 3 dígitos (ej: PRD001)
        // Si el valor supera 999, se ajusta automáticamente (ej: PRD1000)
        return String.format("%s%03d", prefix, newValue);
    }
}
