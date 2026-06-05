package com.empresa.sistema.repository;

import com.empresa.sistema.entity.SolicitudStock;
import com.empresa.sistema.entity.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudStockRepository extends JpaRepository<SolicitudStock, String> {
    List<SolicitudStock> findByEstado(EstadoSolicitud estado);
    List<SolicitudStock> findBySucursalDestinoId(String sucursalId);
}