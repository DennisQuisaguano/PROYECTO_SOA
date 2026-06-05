package com.empresa.sistema.service;

import com.empresa.sistema.dto.producto.ProductoRequestDTO;
import com.empresa.sistema.dto.producto.ProductoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductoService {
    Page<ProductoResponseDTO> findAll(Pageable pageable);
    ProductoResponseDTO findById(String id);
    List<ProductoResponseDTO> buscar(String nombre, String categoriaId);
    ProductoResponseDTO create(ProductoRequestDTO dto);
    ProductoResponseDTO update(String id, ProductoRequestDTO dto);
    void delete(String id);
}