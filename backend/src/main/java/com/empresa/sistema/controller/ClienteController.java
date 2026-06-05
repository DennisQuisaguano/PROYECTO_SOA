package com.empresa.sistema.controller;

import com.empresa.sistema.dto.cliente.ClienteRequestDTO;
import com.empresa.sistema.dto.cliente.ClienteResponseDTO;
import com.empresa.sistema.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    // GET: ADMIN y CAJERO pueden listar (el cajero necesita ver clientes para registrar ventas)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<List<ClienteResponseDTO>> findAll() {
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<ClienteResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(clienteService.findById(id));
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<ClienteResponseDTO> findByCedula(@RequestParam String cedula) {
        return ResponseEntity.ok(clienteService.findByCedula(cedula));
    }

    // POST y PUT: solo ADMIN puede crear o editar clientes
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClienteResponseDTO> create(@Valid @RequestBody ClienteRequestDTO dto) {
        return new ResponseEntity<>(clienteService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClienteResponseDTO> update(@PathVariable String id, @Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.update(id, dto));
    }
}