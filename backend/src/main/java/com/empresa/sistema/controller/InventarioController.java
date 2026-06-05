package com.empresa.sistema.controller;

import com.empresa.sistema.dto.inventario.AjusteStockRequestDTO;
import com.empresa.sistema.dto.inventario.InventarioResponseDTO;
import com.empresa.sistema.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<InventarioResponseDTO>> findBySucursalId(@PathVariable String sucursalId) {
        return ResponseEntity.ok(inventarioService.findBySucursalId(sucursalId));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<InventarioResponseDTO>> findByProductoId(@PathVariable String productoId) {
        return ResponseEntity.ok(inventarioService.findByProductoId(productoId));
    }

    @GetMapping("/producto/{productoId}/global")
    public ResponseEntity<List<InventarioResponseDTO>> checkGlobalStock(
            @PathVariable String productoId,
            @RequestParam(required = false) String excludeSucursalId) {
        if (excludeSucursalId != null) {
            return ResponseEntity.ok(inventarioService.findGlobalStockExcludingSucursal(productoId, excludeSucursalId));
        }
        return ResponseEntity.ok(inventarioService.findByProductoId(productoId));
    }

    @GetMapping("/disponibles/{sucursalId}")
    public ResponseEntity<List<InventarioResponseDTO>> findDisponiblesBySucursalId(@PathVariable String sucursalId) {
        return ResponseEntity.ok(inventarioService.findDisponiblesBySucursalId(sucursalId));
    }

    @PutMapping("/ajustar")
    @PreAuthorize("hasAnyRole('ADMIN', 'BODEGUERO')")
    public ResponseEntity<InventarioResponseDTO> ajustarStock(@Valid @RequestBody AjusteStockRequestDTO dto) {
        return ResponseEntity.ok(inventarioService.ajustarStock(dto));
    }

    @PostMapping("/transferir")
    @PreAuthorize("hasAnyRole('ADMIN', 'BODEGUERO')")
    public ResponseEntity<String> transferirStock(
            @RequestParam String sucursalOrigenId,
            @RequestParam String sucursalDestinoId,
            @RequestParam String productoId,
            @RequestParam Integer cantidad) {
        inventarioService.transferirStock(sucursalOrigenId, sucursalDestinoId, productoId, cantidad);
        return ResponseEntity.ok("Transferencia realizada con éxito");
    }
}