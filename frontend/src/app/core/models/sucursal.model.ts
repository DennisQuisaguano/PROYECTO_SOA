export interface Ciudad {
  id: string;
  nombre: string;
  provincia: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: Ciudad;
}