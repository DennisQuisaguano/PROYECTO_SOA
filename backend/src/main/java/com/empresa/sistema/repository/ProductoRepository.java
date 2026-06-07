package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {
    
    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId) AND p.activo = true")
    List<Producto> findByNombreContainingIgnoreCaseAndCategoriaId(@Param("nombre") String nombre, @Param("categoriaId") String categoriaId);

    @Query(value = "SELECT p FROM Producto p JOIN FETCH p.categoria",
           countQuery = "SELECT count(p) FROM Producto p")
    Page<Producto> findAll(Pageable pageable);

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId AND p.activo = true")
    java.util.List<Producto> findByCategoriaId(@Param("categoriaId") String categoriaId);

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId")
    java.util.List<Producto> findAllByCategoriaId(@Param("categoriaId") String categoriaId);
}