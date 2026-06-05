package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.producto.ProductoRequestDTO;
import com.empresa.sistema.dto.producto.ProductoResponseDTO;
import com.empresa.sistema.entity.Producto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductoMapper {

    @Mapping(source = "categoria.id", target = "categoriaId")
    @Mapping(source = "categoria.nombre", target = "categoriaNombre")
    ProductoResponseDTO toDto(Producto entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    Producto toEntity(ProductoRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void updateEntityFromDto(ProductoRequestDTO dto, @MappingTarget Producto entity);
}