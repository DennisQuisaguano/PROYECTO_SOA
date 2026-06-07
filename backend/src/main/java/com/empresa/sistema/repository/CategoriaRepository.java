package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, String> {
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Categoria c WHERE c.activo = true OR c.activo IS NULL")
    java.util.List<Categoria> findAllActive();
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Categoria c WHERE c.id = :id AND (c.activo = true OR c.activo IS NULL)")
    java.util.Optional<Categoria> findActiveById(@org.springframework.data.repository.query.Param("id") String id);
}