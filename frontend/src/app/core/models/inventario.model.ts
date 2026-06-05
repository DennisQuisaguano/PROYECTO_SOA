import { Producto } from "./producto.model";

export interface Inventario {
  id: string;
  sucursalId: string;
  sucursalNombre: string;
  productoId: string;
  productoNombre: string;
  categoriaId: string;
  categoriaNombre: string;
  precioVenta: number;
  stock: number;
}

export interface AjusteStockRequest {
  sucursalId: string;
  productoId: string;
  cantidad: number;
  motivo: string;
}

export interface TransferenciaRequest {
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  productoId: string;
  cantidad: number;
}