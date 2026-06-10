package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.usuario.UsuarioRequestDTO;
import com.empresa.sistema.dto.usuario.UsuarioResponseDTO;
import com.empresa.sistema.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(source = "rol.id", target = "rolId")
    @Mapping(source = "rol.nombre", target = "rolNombre")
    @Mapping(source = "sucursal.id", target = "sucursalId")
    @Mapping(source = "sucursal.nombre", target = "sucursalNombre")
    @Mapping(target = "nombreCompleto", expression = "java(entity.getNombre() + \" \" + entity.getApellido())")
    UsuarioResponseDTO toDto(Usuario entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "sucursal", ignore = true)
    @Mapping(target = "password", ignore = true)
    Usuario toEntity(UsuarioRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "sucursal", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateEntityFromDto(UsuarioRequestDTO dto, @MappingTarget Usuario entity);
}