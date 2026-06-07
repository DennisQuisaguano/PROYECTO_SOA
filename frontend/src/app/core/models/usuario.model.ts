export interface Usuario {
  id: string;
  username: string;
  nombreCompleto: string;
  rolId: string;
  rolNombre: string;
  sucursalId?: string;
  sucursalNombre?: string;
  activo: boolean;
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  nombreCompleto: string;
  rolId: string;
  sucursalId?: string;
  activo?: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
}