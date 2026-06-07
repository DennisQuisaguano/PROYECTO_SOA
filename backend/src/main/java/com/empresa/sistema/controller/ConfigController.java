package com.empresa.sistema.controller;

import com.empresa.sistema.util.IvaCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    private final IvaCalculator ivaCalculator;

    @Value("${app.empresa.nombre}")
    private String empresaNombre;

    @Value("${app.empresa.ruc}")
    private String empresaRuc;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("ivaPorcentaje", ivaCalculator.getPorcentaje());
        config.put("empresaNombre", empresaNombre);
        config.put("empresaRuc", empresaRuc);
        return ResponseEntity.ok(config);
    }

    @PostMapping("/iva")
    public ResponseEntity<Map<String, Object>> updateIva(@RequestBody Map<String, Integer> payload) {
        Integer nuevoIva = payload.get("ivaPorcentaje");
        if (nuevoIva == null) {
            return ResponseEntity.badRequest().build();
        }
        ivaCalculator.setPorcentaje(nuevoIva);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("ivaPorcentaje", ivaCalculator.getPorcentaje());
        return ResponseEntity.ok(response);
    }
}