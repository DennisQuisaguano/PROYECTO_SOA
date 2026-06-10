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
    @Mapping(source = "clienteNombreCompleto", target = "clienteNombre")
    @Mapping(source = "clienteCedula", target = "clienteCedula")
    @Mapping(source = "clienteTelefono", target = "clienteTelefono")
    @Mapping(source = "clienteDireccion", target = "clienteDireccion")
    @Mapping(source = "clienteEmail", target = "clienteEmail")
    @Mapping(source = "sucursal.id", target = "sucursalId")
    @Mapping(source = "sucursal.nombre", target = "sucursalNombre")
    @Mapping(source = "cajero.id", target = "cajeroId")
    @Mapping(target = "cajeroNombre", expression = "java(entity.getCajero().getNombre() + \" \" + entity.getCajero().getApellido())")
    VentaResponseDTO toDto(Venta entity);

    @org.mapstruct.AfterMapping
    default void calcularDesgloseIva(Venta entity, @org.mapstruct.MappingTarget VentaResponseDTO dto) {
        java.util.Map<String, java.math.BigDecimal> desglose = new java.util.HashMap<>();
        if (entity.getDetalles() != null) {
            for (com.empresa.sistema.entity.DetalleVenta d : entity.getDetalles()) {
                String pct = (d.getPorcentajeIva() != null ? d.getPorcentajeIva().setScale(2).toString() : "0.00");
                java.math.BigDecimal subtotalLinea = d.getSubtotal();
                java.math.BigDecimal factor = new java.math.BigDecimal(pct).divide(new java.math.BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
                java.math.BigDecimal montoIva = subtotalLinea.multiply(factor).setScale(2, java.math.RoundingMode.HALF_UP);
                
                desglose.merge(pct, montoIva, java.math.BigDecimal::add);
            }
        }
        dto.setDesgloseIva(desglose);
    }

    @Mapping(source = "producto.id", target = "productoId")
    @Mapping(source = "productoNombre", target = "productoNombre")
    @Mapping(source = "precioUnitario", target = "precioUnitario")
    DetalleVentaDTO toDto(DetalleVenta entity);
}