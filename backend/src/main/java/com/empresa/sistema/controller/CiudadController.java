package com.empresa.sistema.controller;

import com.empresa.sistema.entity.Ciudad;
import com.empresa.sistema.repository.CiudadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
@RequiredArgsConstructor
public class CiudadController {

    private final CiudadRepository ciudadRepository;

    @GetMapping
    public ResponseEntity<List<Ciudad>> findAll() {
        return ResponseEntity.ok(ciudadRepository.findAll());
    }
}