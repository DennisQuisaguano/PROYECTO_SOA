package com.empresa.sistema.controller;

import com.empresa.sistema.dto.inventario.MovimientoInventarioResponseDTO;
import com.empresa.sistema.entity.MovimientoInventario;
import com.empresa.sistema.mapper.MovimientoInventarioMapper;
import com.empresa.sistema.repository.MovimientoInventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventarios/movimientos")
@RequiredArgsConstructor
public class MovimientoInventarioController {

    private final MovimientoInventarioRepository movimientoRepository;
    private final MovimientoInventarioMapper movimientoMapper;

    @GetMapping("/sucursal/{sucursalId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BODEGUERO')")
    public ResponseEntity<Page<MovimientoInventarioResponseDTO>> listarPorSucursal(
            @PathVariable String sucursalId,
            Pageable pageable) {
        return ResponseEntity.ok(movimientoRepository.findBySucursalIdOrderByFechaDesc(sucursalId, pageable)
                .map(movimientoMapper::toDto));
    }
}
