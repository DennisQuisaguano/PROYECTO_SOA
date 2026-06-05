package com.empresa.sistema.controller;

import com.empresa.sistema.entity.SolicitudStock;
import com.empresa.sistema.service.SolicitudStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes-stock")
@RequiredArgsConstructor
public class SolicitudStockController {

    private final SolicitudStockService service;

    @PostMapping
    public ResponseEntity<com.empresa.sistema.dto.inventario.SolicitudStockResponseDTO> crear(@RequestParam String origenId, @RequestParam String destinoId, @RequestParam String productoId, @RequestParam Integer cantidad) {
        return ResponseEntity.ok(service.crearSolicitud(origenId, destinoId, productoId, cantidad));
    }

    @GetMapping
    public ResponseEntity<List<com.empresa.sistema.dto.inventario.SolicitudStockResponseDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasAnyRole('BODEGUERO')")
    public ResponseEntity<Void> aprobar(@PathVariable String id, @RequestParam(required = false) Integer cantidad) {
        service.aprobarSolicitud(id, cantidad);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('ADMIN', 'BODEGUERO')")
    public ResponseEntity<Void> rechazar(@PathVariable String id) {
        service.rechazarSolicitud(id);
        return ResponseEntity.ok().build();
    }
}