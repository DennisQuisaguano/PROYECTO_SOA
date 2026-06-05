package com.empresa.sistema.repository;

import com.empresa.sistema.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, String> {
    List<DetalleVenta> findByVentaId(String ventaId);
}