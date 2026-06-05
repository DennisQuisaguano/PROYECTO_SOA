package com.empresa.sistema.service;

import com.empresa.sistema.dto.inventario.AjusteStockRequestDTO;
import com.empresa.sistema.dto.inventario.InventarioResponseDTO;

import java.util.List;

public interface InventarioService {
    List<InventarioResponseDTO> findBySucursalId(String sucursalId);
    List<InventarioResponseDTO> findByProductoId(String productoId);
    List<InventarioResponseDTO> findGlobalStockExcludingSucursal(String productoId, String excludeSucursalId);
    List<InventarioResponseDTO> findDisponiblesBySucursalId(String sucursalId);
    void verificarYDescontarStock(String productoId, String sucursalId, Integer cantidad);
    InventarioResponseDTO ajustarStock(AjusteStockRequestDTO dto);
    void transferirStock(String sucursalOrigenId, String sucursalDestinoId, String productoId, Integer cantidad);
    void transferirStockInterno(String sucursalOrigenId, String sucursalDestinoId, String productoId, Integer cantidad);
    /**
     * Ajuste interno sin validación de roles. Usar solo desde contextos controlados
     * (ej: anulación de ventas por el sistema).
     */
    void realizarAjusteInternoPublico(AjusteStockRequestDTO dto);
}