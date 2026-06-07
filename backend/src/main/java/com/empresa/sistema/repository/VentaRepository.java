package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Venta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {
    
    @Query("SELECT v FROM Venta v JOIN FETCH v.cliente JOIN FETCH v.sucursal JOIN FETCH v.cajero WHERE v.sucursal.id = :sucursalId ORDER BY v.fecha DESC")
    Page<Venta> findBySucursalIdOrderByFechaDesc(@Param("sucursalId") String sucursalId, Pageable pageable);

    @Query(value = "SELECT v FROM Venta v JOIN FETCH v.cliente JOIN FETCH v.sucursal JOIN FETCH v.cajero ORDER BY v.fecha DESC",
           countQuery = "SELECT count(v) FROM Venta v")
    Page<Venta> findAllOrderByFechaDesc(Pageable pageable);

    @Query("SELECT v FROM Venta v JOIN FETCH v.cliente JOIN FETCH v.sucursal JOIN FETCH v.cajero WHERE v.fecha BETWEEN :desde AND :hasta ORDER BY v.fecha DESC")
    List<Venta> findByFechaBetween(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}