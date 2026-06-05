package com.empresa.sistema.service;

import com.empresa.sistema.dto.inventario.SolicitudStockResponseDTO;
import java.util.List;

public interface SolicitudStockService {
    SolicitudStockResponseDTO crearSolicitud(String origenId, String destinoId, String productoId, Integer cantidad);
    List<SolicitudStockResponseDTO> findAll();
    void aprobarSolicitud(String id, Integer cantidadAprobada);
    void rechazarSolicitud(String id);
}
