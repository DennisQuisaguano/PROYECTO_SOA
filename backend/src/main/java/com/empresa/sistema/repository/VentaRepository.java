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
    
    Page<Venta> findBySucursalIdOrderByFechaDesc(String sucursalId, Pageable pageable);

    @Query("SELECT v FROM Venta v ORDER BY v.fecha DESC")
    Page<Venta> findAllOrderByFechaDesc(Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.fecha BETWEEN :desde AND :hasta ORDER BY v.fecha DESC")
    List<Venta> findByFechaBetween(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}