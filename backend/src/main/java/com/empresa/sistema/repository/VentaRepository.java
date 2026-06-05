package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Venta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {
    Page<Venta> findBySucursalId(String sucursalId, Pageable pageable);
    List<Venta> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
}