import { Producto } from "./producto.model";

export interface Inventario {
  id: string;
  sucursalId: string;
  sucursalNombre: string;
  productoId: string;
  productoNombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre: string;
  costoUnitario: number;
  precioVenta: number;
  stock: number;
  activo: boolean;
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