import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sucursal, Ciudad } from '../models/sucursal.model';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private http = inject(HttpClient);
  
  obtenerTodas(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${environment.apiUrl}/sucursales`);
  }

  obtenerCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${environment.apiUrl}/ciudades`);
  }
}