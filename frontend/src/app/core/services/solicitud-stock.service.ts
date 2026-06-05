import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudStockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/solicitudes-stock`;

  crear(origenId: string, destinoId: string, productoId: string, cantidad: number): Observable<any> {
    return this.http.post(this.apiUrl, null, {
      params: { origenId, destinoId, productoId, cantidad: cantidad.toString() }
    });
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  aprobar(id: string, cantidad?: number): Observable<void> {
    let params = {};
    if (cantidad) {
      params = { cantidad: cantidad.toString() };
    }
    return this.http.put<void>(`${this.apiUrl}/${id}/aprobar`, {}, { params });
  }

  rechazar(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/rechazar`, {});
  }
}