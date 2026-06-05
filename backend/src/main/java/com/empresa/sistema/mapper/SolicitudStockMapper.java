package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.inventario.SolicitudStockResponseDTO;
import com.empresa.sistema.entity.SolicitudStock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SolicitudStockMapper {

    @Mapping(source = "sucursalOrigen.id", target = "sucursalOrigenId")
    @Mapping(source = "sucursalOrigen.nombre", target = "sucursalOrigenNombre")
    @Mapping(source = "sucursalDestino.id", target = "sucursalDestinoId")
    @Mapping(source = "sucursalDestino.nombre", target = "sucursalDestinoNombre")
    @Mapping(source = "producto.id", target = "productoId")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    @Mapping(source = "fechaCreacion", target = "fechaCreacion")
    SolicitudStockResponseDTO toDto(SolicitudStock entity);
}