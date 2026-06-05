package com.empresa.sistema.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class IvaCalculator {

    @Value("${app.iva.porcentaje}")
    private int porcentajeIva;

    public BigDecimal calcularIva(BigDecimal subtotal) {
        if (subtotal == null) return BigDecimal.ZERO;
        BigDecimal porcentaje = new BigDecimal(porcentajeIva).divide(new BigDecimal(100));
        return subtotal.multiply(porcentaje).setScale(2, RoundingMode.HALF_UP);
    }

    public int getPorcentaje() {
        return porcentajeIva;
    }
}