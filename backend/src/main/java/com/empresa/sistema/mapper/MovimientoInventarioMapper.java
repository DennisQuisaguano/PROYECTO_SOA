package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.inventario.MovimientoInventarioResponseDTO;
import com.empresa.sistema.entity.MovimientoInventario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MovimientoInventarioMapper {

    @Mapping(source = "sucursal.nombre", target = "sucursalNombre")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    MovimientoInventarioResponseDTO toDto(MovimientoInventario entity);
}
