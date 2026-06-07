package com.empresa.sistema.util;

import com.empresa.sistema.dto.eventos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publicarCambioStock(String sucursalId, StockUpdateEvent evento) {
        messagingTemplate.convertAndSend("/topic/stock/" + sucursalId, evento);
    }

    public void publicarAlertaStock(String sucursalId, AlertaStockEvent evento) {
        messagingTemplate.convertAndSend("/topic/alertas/" + sucursalId, evento);
    }

    public void publicarNuevaVenta(String sucursalId, VentaEvent evento) {
        messagingTemplate.convertAndSend("/topic/ventas/" + sucursalId, evento);
    }

    public void publicarCambioSolicitud(String sucursalId, SolicitudEvent evento) {
        messagingTemplate.convertAndSend("/topic/solicitudes/" + sucursalId, evento);
    }

    public void publicarCambioProducto(ProductoEvent evento) {
        messagingTemplate.convertAndSend("/topic/productos", evento);
    }

    public void publicarCambioCliente(ClienteEvent evento) {
        messagingTemplate.convertAndSend("/topic/clientes", evento);
    }
}
