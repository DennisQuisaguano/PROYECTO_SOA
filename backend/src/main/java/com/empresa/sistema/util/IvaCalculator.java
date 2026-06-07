package com.empresa.sistema.util;

import com.empresa.sistema.entity.GlobalConfig;
import com.empresa.sistema.repository.GlobalConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
public class IvaCalculator {

    private final GlobalConfigRepository configRepository;

    @Value("${app.iva.porcentaje}")
    private int porcentajeIvaDefault;

    public BigDecimal calcularIva(BigDecimal subtotal) {
        if (subtotal == null) return BigDecimal.ZERO;
        BigDecimal porcentaje = new BigDecimal(getPorcentaje()).divide(new BigDecimal(100));
        return subtotal.multiply(porcentaje).setScale(2, RoundingMode.HALF_UP);
    }

    public int getPorcentaje() {
        return configRepository.findById("iva_porcentaje")
                .map(config -> Integer.parseInt(config.getValor()))
                .orElse(porcentajeIvaDefault);
    }

    public void setPorcentaje(int nuevoPorcentaje) {
        GlobalConfig config = configRepository.findById("iva_porcentaje")
                .orElse(new GlobalConfig("iva_porcentaje", String.valueOf(porcentajeIvaDefault)));
        config.setValor(String.valueOf(nuevoPorcentaje));
        configRepository.save(config);
    }
}