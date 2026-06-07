export interface DetalleVentaItem {
  productoId: string;
  cantidad: number;
}

export interface VentaRequest {
  clienteId: string;
  sucursalId: string;
  cajeroId: string;
  detalles: DetalleVentaItem[];
}

export interface DetalleVentaResponse {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: string;
  numFac: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
  clienteId: string;
  clienteNombre: string;
  clienteCedula: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteEmail?: string;
  sucursalId: string;
  sucursalNombre: string;
  cajeroId: string;
  cajeroNombre: string;
  detalles: DetalleVentaResponse[];
  desgloseIva?: { [key: string]: number };
}