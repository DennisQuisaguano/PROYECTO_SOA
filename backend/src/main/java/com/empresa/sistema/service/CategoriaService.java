package com.empresa.sistema.service;

import com.empresa.sistema.entity.Categoria;
import java.util.List;

public interface CategoriaService {
    List<Categoria> findAll();
    List<Categoria> findAllActive();
    Categoria findById(String id);
    Categoria create(Categoria categoria);
    Categoria update(String id, Categoria categoria);
    void delete(String id);
}
