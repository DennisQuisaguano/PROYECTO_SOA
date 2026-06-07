package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Inventario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, String> {
    
    @Query("SELECT i FROM Inventario i JOIN FETCH i.producto JOIN FETCH i.producto.categoria WHERE i.sucursal.id = :sucursalId")
    List<Inventario> findBySucursalId(@Param("sucursalId") String sucursalId);

    @Query("SELECT i FROM Inventario i JOIN FETCH i.producto JOIN FETCH i.producto.categoria WHERE i.producto.id = :productoId")
    List<Inventario> findByProductoId(@Param("productoId") String productoId);

    @Query("SELECT i FROM Inventario i JOIN FETCH i.producto JOIN FETCH i.producto.categoria WHERE i.producto.id = :productoId AND i.sucursal.id <> :sucursalId")
    List<Inventario> findByProductoIdAndSucursal_IdNot(@Param("productoId") String productoId, @Param("sucursalId") String sucursalId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventario i JOIN FETCH i.producto WHERE i.sucursal.id = :sucursalId AND i.producto.id = :productoId")
    Optional<Inventario> findBySucursalIdAndProductoId(@Param("sucursalId") String sucursalId, @Param("productoId") String productoId);

    @Query("SELECT i FROM Inventario i JOIN FETCH i.producto JOIN FETCH i.producto.categoria WHERE i.sucursal.id = :sucursalId AND i.stock > :stock")
    List<Inventario> findBySucursalIdAndStockGreaterThan(@Param("sucursalId") String sucursalId, @Param("stock") Integer stock);
}