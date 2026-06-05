package com.empresa.sistema.util;

import com.empresa.sistema.entity.ConfiguracionFactura;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.repository.ConfiguracionFacturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class NumeroFacturaUtil {

    private final ConfiguracionFacturaRepository configuracionFacturaRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public synchronized String generateNumero(String sucursalId) {
        ConfiguracionFactura config = configuracionFacturaRepository.findBySucursalIdForUpdate(sucursalId)
                .orElseThrow(() -> new ValidacionException("Configuración de factura no encontrada para la sucursal"));
        
        config.setUltimoNumero(config.getUltimoNumero() + 1);
        configuracionFacturaRepository.save(config);

        return String.format("%s-%08d", sucursalId, config.getUltimoNumero());
    }
}