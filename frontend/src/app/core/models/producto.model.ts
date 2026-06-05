import { Categoria } from "./categoria.model";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  costoUnitario: number;
  precioVenta: number;
  activo: boolean;
  categoriaId: string;
  categoriaNombre: string;
}

export interface ProductoRequest {
  nombre: string;
  descripcion?: string;
  costoUnitario: number;
  precioVenta: number;
  categoriaId: string;
  stockInicial?: number;
  sucursalId?: string;
}