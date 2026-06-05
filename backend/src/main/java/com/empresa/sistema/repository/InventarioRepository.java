package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Inventario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, String> {
    List<Inventario> findBySucursalId(String sucursalId);
    List<Inventario> findByProductoId(String productoId);
    List<Inventario> findByProductoIdAndSucursal_IdNot(String productoId, String sucursalId);
    List<Inventario> findByProductoIdAndStockGreaterThan(String productoId, Integer stock);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Inventario> findBySucursalIdAndProductoId(String sucursalId, String productoId);

    List<Inventario> findBySucursalIdAndStockGreaterThan(String sucursalId, Integer stock);
}