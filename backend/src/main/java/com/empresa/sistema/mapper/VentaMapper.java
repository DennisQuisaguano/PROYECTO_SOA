package com.empresa.sistema.mapper;

import com.empresa.sistema.dto.venta.DetalleVentaDTO;
import com.empresa.sistema.dto.venta.VentaResponseDTO;
import com.empresa.sistema.entity.DetalleVenta;
import com.empresa.sistema.entity.Venta;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VentaMapper {

    @Mapping(source = "cliente.id", target = "clienteId")
    @Mapping(source = "cliente.cedula", target = "clienteCedula")
    @Mapping(target = "clienteNombre", expression = "java(entity.getCliente().getNombreUno() + ' ' + entity.getCliente().getApellidoPaterno())")
    @Mapping(source = "sucursal.id", target = "sucursalId")
    @Mapping(source = "sucursal.nombre", target = "sucursalNombre")
    @Mapping(source = "cajero.id", target = "cajeroId")
    @Mapping(source = "cajero.nombreCompleto", target = "cajeroNombre")
    VentaResponseDTO toDto(Venta entity);

    @Mapping(source = "producto.id", target = "productoId")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    DetalleVentaDTO toDto(DetalleVenta entity);
}