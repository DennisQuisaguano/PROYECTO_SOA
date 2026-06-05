import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { 
  StockUpdateEvent, 
  AlertaStockEvent, 
  VentaEvent, 
  SolicitudEvent, 
  ProductoEvent 
} from '../models/realtime.model';

@Injectable({
  providedIn: 'root'
})
export class RealtimeNotificationService {
  private wsService = inject(WebSocketService);

  private stockUpdate$ = new Subject<StockUpdateEvent>();
  private alertaStock$ = new Subject<AlertaStockEvent>();
  private ventaEvent$ = new Subject<VentaEvent>();
  private solicitudEvent$ = new Subject<SolicitudEvent>();
  private productoEvent$ = new Subject<ProductoEvent>();

  onStockUpdate(): Observable<StockUpdateEvent> {
    return this.stockUpdate$.asObservable();
  }

  onAlertaStock(): Observable<AlertaStockEvent> {
    return this.alertaStock$.asObservable();
  }

  onVentaEvent(): Observable<VentaEvent> {
    return this.ventaEvent$.asObservable();
  }

  onSolicitudEvent(): Observable<SolicitudEvent> {
    return this.solicitudEvent$.asObservable();
  }

  onProductoEvent(): Observable<ProductoEvent> {
    return this.productoEvent$.asObservable();
  }

  inicializarParaSucursal(sucursalId: string): void {
    this.wsService.connect();

    this.wsService.suscribir<StockUpdateEvent>(`/topic/stock/${sucursalId}`, (evento) => {
      this.stockUpdate$.next(evento);
    });

    this.wsService.suscribir<AlertaStockEvent>(`/topic/alertas/${sucursalId}`, (evento) => {
      this.alertaStock$.next(evento);
    });

    this.wsService.suscribir<VentaEvent>(`/topic/ventas/${sucursalId}`, (evento) => {
      this.ventaEvent$.next(evento);
    });

    this.wsService.suscribir<SolicitudEvent>(`/topic/solicitudes/${sucursalId}`, (evento) => {
      this.solicitudEvent$.next(evento);
    });

    this.wsService.suscribir<ProductoEvent>('/topic/productos', (evento) => {
      this.productoEvent$.next(evento);
    });
  }

  desconectar(): void {
    this.wsService.disconnect();
  }
}
