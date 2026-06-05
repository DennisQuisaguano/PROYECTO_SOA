export interface Cliente {
  id: string;
  cedula: string;
  nombreUno: string;
  nombreDos?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface ClienteRequest {
  cedula: string;
  nombreUno: string;
  nombreDos?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono: string;
  direccion: string;
}