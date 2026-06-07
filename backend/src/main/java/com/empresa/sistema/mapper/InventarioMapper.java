package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.inventario.InventarioResponseDTO;
import com.empresa.sistema.entity.Inventario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventarioMapper {

    @Mapping(source = "sucursal.id", target = "sucursalId")
    @Mapping(source = "sucursal.nombre", target = "sucursalNombre")
    @Mapping(source = "producto.id", target = "productoId")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    @Mapping(source = "producto.descripcion", target = "descripcion")
    @Mapping(source = "producto.categoria.id", target = "categoriaId")
    @Mapping(source = "producto.categoria.nombre", target = "categoriaNombre")
    @Mapping(source = "producto.costoUnitario", target = "costoUnitario")
    @Mapping(source = "producto.precioVenta", target = "precioVenta")
    @Mapping(source = "producto.activo", target = "activo")
    InventarioResponseDTO toDto(Inventario entity);
}