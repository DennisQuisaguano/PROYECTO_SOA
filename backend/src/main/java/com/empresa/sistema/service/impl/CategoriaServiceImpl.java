package com.empresa.sistema.service.impl;

import com.empresa.sistema.entity.Categoria;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.repository.CategoriaRepository;
import com.empresa.sistema.service.CategoriaService;
import com.empresa.sistema.util.SequenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final com.empresa.sistema.repository.ProductoRepository productoRepository;
    private final SequenceGenerator sequenceGenerator;

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> findAllActive() {
        return categoriaRepository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public Categoria findById(String id) {
        return categoriaRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
    }

    @Override
    @Transactional
    public Categoria create(Categoria categoria) {
        categoria.setId(sequenceGenerator.nextId("CAT"));
        categoria.setActivo(true);
        return categoriaRepository.save(categoria);
    }

    @Override
    @Transactional
    public Categoria update(String id, Categoria data) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        
        boolean estadoAnterior = categoria.getActivo();
        boolean nuevoEstado = data.getActivo();

        categoria.setNombre(data.getNombre());
        categoria.setDescripcion(data.getDescripcion());
        categoria.setActivo(nuevoEstado);
        
        Categoria saved = categoriaRepository.save(categoria);

        // Si el estado cambió, aplicar cascada a todos los productos
        if (estadoAnterior != nuevoEstado) {
            List<com.empresa.sistema.entity.Producto> productos = productoRepository.findAllByCategoriaId(id);
            for (com.empresa.sistema.entity.Producto producto : productos) {
                producto.setActivo(nuevoEstado);
            }
            productoRepository.saveAll(productos);
            log.info(">>> CASCADE UPDATE: {} productos de la categoría '{}' han sido marcados como {}", 
                    productos.size(), saved.getNombre(), nuevoEstado ? "ACTIVOS" : "INACTIVOS");
        }

        return saved;
    }

    @Override
    @Transactional
    public void delete(String id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        
        // 1. Desactivar la categoría (Borrado lógico)
        categoria.setActivo(false);
        categoriaRepository.save(categoria);

        // 2. Desactivación en Cascada: Desactivar todos los productos de esta categoría
        List<com.empresa.sistema.entity.Producto> productos = productoRepository.findAllByCategoriaId(id);
        for (com.empresa.sistema.entity.Producto producto : productos) {
            producto.setActivo(false);
        }
        productoRepository.saveAll(productos);
    }
}
