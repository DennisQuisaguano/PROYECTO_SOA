export interface StockUpdateEvent {
  tipo: 'STOCK_UPDATE';
  productoId: string;
  productoNombre: string;
  sucursalId: string;
  stockAnterior: number;
  stockActual: number;
  motivoCambio: 'VENTA' | 'ANULACION' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SALIDA';
  timestamp: string;
}

export interface AlertaStockEvent {
  tipo: 'ALERTA_STOCK';
  productoId: string;
  productoNombre: string;
  sucursalId: string;
  stockActual: number;
  nivelAlerta: 'BAJO' | 'CRITICO' | 'AGOTADO';
  timestamp: string;
}

export interface VentaEvent {
  tipo: 'NUEVA_VENTA' | 'VENTA_ANULADA';
  ventaId: string;
  numFac: string;
  sucursalId: string;
  total: number;
  cajeroUsername: string;
  timestamp: string;
}

export interface SolicitudEvent {
  tipo: 'NUEVA_SOLICITUD' | 'SOLICITUD_APROBADA' | 'SOLICITUD_RECHAZADA';
  solicitudId: string;
  sucursalSolicitanteId: string;
  sucursalOrigenId: string;
  productoNombre: string;
  cantidadSolicitada: number;
  cantidadAprobada: number;
  estado: string;
  timestamp: string;
}

export interface ProductoEvent {
  tipo: 'PRODUCTO_CREADO' | 'PRODUCTO_ACTUALIZADO' | 'PRODUCTO_DESACTIVADO';
  productoId: string;
  productoNombre: string;
  categoriaId: string;
  timestamp: string;
}

export interface ClienteEvent {
  tipo: 'CLIENTE_CREADO' | 'CLIENTE_ACTUALIZADO' | 'CLIENTE_ELIMINADO';
  clienteId: string;
  cedula: string;
  nombreCompleto: string;
  timestamp: string;
}
