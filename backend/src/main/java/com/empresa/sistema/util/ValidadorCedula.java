package com.empresa.sistema.util;

import com.empresa.sistema.exception.ValidacionException;
import org.springframework.stereotype.Component;

@Component
public class ValidadorCedula {

    public void validar(String cedula) {
        if (cedula == null || cedula.length() != 10 || !cedula.matches("\\d+")) {
            throw new ValidacionException("La cédula debe tener exactamente 10 dígitos numéricos");
        }

        int provincia = Integer.parseInt(cedula.substring(0, 2));
        if (provincia < 1 || provincia > 24) {
            throw new ValidacionException("Los dos primeros dígitos de la cédula no corresponden a una provincia válida (01-24)");
        }

        int[] coeficientes = {2, 1, 2, 1, 2, 1, 2, 1, 2};
        int digitoVerificador = Integer.parseInt(cedula.substring(9, 10));
        int suma = 0;

        for (int i = 0; i < coeficientes.length; i++) {
            int valor = Integer.parseInt(cedula.substring(i, i + 1)) * coeficientes[i];
            suma += (valor >= 10) ? valor - 9 : valor;
        }

        int decenaSuperior = (suma % 10 == 0) ? suma : (suma / 10 + 1) * 10;
        int digitoCalculado = decenaSuperior - suma;

        if (digitoCalculado != digitoVerificador) {
            throw new ValidacionException("La cédula ingresada no es válida (dígito verificador incorrecto)");
        }
    }
}