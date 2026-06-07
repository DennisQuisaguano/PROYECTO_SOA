package com.empresa.sistema.controller;

import com.empresa.sistema.dto.venta.VentaRequestDTO;
import com.empresa.sistema.dto.venta.VentaResponseDTO;
import com.empresa.sistema.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponseDTO> create(@Valid @RequestBody VentaRequestDTO dto) {
        return new ResponseEntity<>(ventaService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<VentaResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ventaService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(ventaService.findById(id));
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<Page<VentaResponseDTO>> findBySucursalId(
            @PathVariable String sucursalId,
            Pageable pageable) {
        return ResponseEntity.ok(ventaService.findBySucursalId(sucursalId, pageable));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<VentaResponseDTO>> findByFechaBetween(
            @RequestParam String desde,
            @RequestParam String hasta) {
        LocalDateTime inicio = LocalDate.parse(desde).atStartOfDay();
        LocalDateTime fin = LocalDate.parse(hasta).atTime(23, 59, 59);
        return ResponseEntity.ok(ventaService.findByFechaBetween(inicio, fin));
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<VentaResponseDTO> anularVenta(@PathVariable String id) {
        return ResponseEntity.ok(ventaService.anularVenta(id));
    }

    @GetMapping("/{id}/factura")
    public ResponseEntity<byte[]> generarFacturaPdf(@PathVariable String id) {
        byte[] pdf = ventaService.generarFacturaPdf(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "factura-" + id + ".pdf");
        
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}