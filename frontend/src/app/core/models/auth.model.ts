export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  rol: string;
  sucursalId: string;
  nombreCompleto: string;
}