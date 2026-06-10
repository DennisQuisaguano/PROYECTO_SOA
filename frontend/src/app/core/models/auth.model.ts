export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  rol: string;
  sucursalId: string | null;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
}