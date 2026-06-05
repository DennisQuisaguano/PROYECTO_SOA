package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.cliente.ClienteRequestDTO;
import com.empresa.sistema.dto.cliente.ClienteResponseDTO;
import com.empresa.sistema.entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClienteMapper {

    ClienteResponseDTO toDto(Cliente entity);

    @Mapping(target = "id", ignore = true)
    Cliente toEntity(ClienteRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(ClienteRequestDTO dto, @MappingTarget Cliente entity);
}