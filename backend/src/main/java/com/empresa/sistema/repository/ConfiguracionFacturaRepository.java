package com.empresa.sistema.repository;

import com.empresa.sistema.entity.ConfiguracionFactura;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionFacturaRepository extends JpaRepository<ConfiguracionFactura, String> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ConfiguracionFactura c WHERE c.sucursal.id = :sucursalId")
    Optional<ConfiguracionFactura> findBySucursalIdForUpdate(@Param("sucursalId") String sucursalId);
}