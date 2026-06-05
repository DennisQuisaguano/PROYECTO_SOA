package com.empresa.sistema.service;

import com.empresa.sistema.dto.venta.VentaRequestDTO;
import com.empresa.sistema.dto.venta.VentaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaService {
    VentaResponseDTO create(VentaRequestDTO dto);
    VentaResponseDTO findById(String id);
    Page<VentaResponseDTO> findBySucursalId(String sucursalId, Pageable pageable);
    List<VentaResponseDTO> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
    VentaResponseDTO anularVenta(String id);
    byte[] generarFacturaPdf(String id);
}