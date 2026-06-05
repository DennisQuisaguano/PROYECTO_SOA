package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.eventos.ProductoEvent;
import com.empresa.sistema.dto.producto.ProductoRequestDTO;
import com.empresa.sistema.dto.producto.ProductoResponseDTO;
import com.empresa.sistema.entity.Categoria;
import com.empresa.sistema.entity.Producto;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.mapper.ProductoMapper;
import com.empresa.sistema.repository.CategoriaRepository;
import com.empresa.sistema.repository.ProductoRepository;
import com.empresa.sistema.service.ProductoService;
import com.empresa.sistema.util.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final com.empresa.sistema.repository.SucursalRepository sucursalRepository;
    private final com.empresa.sistema.repository.InventarioRepository inventarioRepository;
    private final ProductoMapper productoMapper;
    private final WebSocketEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductoResponseDTO> findAll(Pageable pageable) {
        return productoRepository.findAll(pageable)
                .map(productoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO findById(String id) {
        return productoRepository.findById(id)
                .map(productoMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscar(String nombre, String categoriaId) {
        return productoRepository.findByNombreContainingIgnoreCaseAndCategoriaId(nombre, categoriaId)
                .stream()
                .map(productoMapper::toDto)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public ProductoResponseDTO create(ProductoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        
        Producto producto = productoMapper.toEntity(dto);
        producto.setCategoria(categoria);
        Producto savedProduct = productoRepository.save(producto);

        // Inicializar inventario SOLO para la sucursal especificada (si se proporciona)
        if (dto.getSucursalId() != null && !dto.getSucursalId().isEmpty()) {
            com.empresa.sistema.entity.Sucursal sucursal = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada: " + dto.getSucursalId()));

            int stock = dto.getStockInicial() != null ? dto.getStockInicial() : 0;

            com.empresa.sistema.entity.Inventario inv = com.empresa.sistema.entity.Inventario.builder()
                    .sucursal(sucursal)
                    .producto(savedProduct)
                    .stock(stock)
                    .build();
            inventarioRepository.save(inv);
        }

        // WebSocket Event
        eventPublisher.publicarCambioProducto(ProductoEvent.builder()
                .tipo("PRODUCTO_CREADO")
                .productoId(savedProduct.getId())
                .productoNombre(savedProduct.getNombre())
                .categoriaId(savedProduct.getCategoria().getId())
                .timestamp(LocalDateTime.now())
                .build());

        return productoMapper.toDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductoResponseDTO update(String id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        productoMapper.updateEntityFromDto(dto, producto);
        producto.setCategoria(categoria);
        Producto saved = productoRepository.save(producto);

        // WebSocket Event
        eventPublisher.publicarCambioProducto(ProductoEvent.builder()
                .tipo("PRODUCTO_ACTUALIZADO")
                .productoId(saved.getId())
                .productoNombre(saved.getNombre())
                .categoriaId(saved.getCategoria().getId())
                .timestamp(LocalDateTime.now())
                .build());

        return productoMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        producto.setActivo(false);
        Producto saved = productoRepository.save(producto);

        // WebSocket Event
        eventPublisher.publicarCambioProducto(ProductoEvent.builder()
                .tipo("PRODUCTO_DESACTIVADO")
                .productoId(saved.getId())
                .productoNombre(saved.getNombre())
                .categoriaId(saved.getCategoria().getId())
                .timestamp(LocalDateTime.now())
                .build());
    }
}