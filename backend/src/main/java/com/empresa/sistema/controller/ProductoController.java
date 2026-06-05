package com.empresa.sistema.controller;

import com.empresa.sistema.dto.producto.ProductoRequestDTO;
import com.empresa.sistema.dto.producto.ProductoResponseDTO;
import com.empresa.sistema.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<Page<ProductoResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(productoService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(productoService.findById(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponseDTO>> buscar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoriaId) {
        return ResponseEntity.ok(productoService.buscar(nombre, categoriaId));
    }

    @PostMapping
    public ResponseEntity<ProductoResponseDTO> create(@Valid @RequestBody ProductoRequestDTO dto) {
        return new ResponseEntity<>(productoService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> update(@PathVariable String id, @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}