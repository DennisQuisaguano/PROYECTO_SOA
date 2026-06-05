package com.empresa.sistema.repository;

import com.empresa.sistema.entity.MovimientoInventario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, String> {
    Page<MovimientoInventario> findBySucursalIdOrderByFechaDesc(String sucursalId, Pageable pageable);
}
