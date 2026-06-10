export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  rolId: string;
  rolNombre: string;
  sucursalId?: string;
  sucursalNombre?: string;
  activo: boolean;
  telefono?: string;
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  rolId: string;
  sucursalId?: string;
  activo?: boolean;
  telefono?: string;
}

export interface Rol {
  id: string;
  nombre: string;
}