import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventario, AjusteStockRequest } from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventarios`;

  findBySucursalId(sucursalId: string): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/sucursal/${sucursalId}`);
  }

  findByProductoId(productoId: string, excludeSucursalId?: string): Observable<Inventario[]> {
    let url = `${this.apiUrl}/producto/${productoId}/global`;
    if (excludeSucursalId) {
      url += `?excludeSucursalId=${excludeSucursalId}`;
    }
    return this.http.get<Inventario[]>(url);
  }

  findDisponiblesBySucursalId(sucursalId: string): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/disponibles/${sucursalId}`);
  }

  ajustarStock(request: AjusteStockRequest): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/ajustar`, request);
  }

  transferirStock(origen: string, destino: string, producto: string, cantidad: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/transferir`, null, {
      params: {
        sucursalOrigenId: origen,
        sucursalDestinoId: destino,
        productoId: producto,
        cantidad: cantidad.toString()
      },
      responseType: 'text'
    });
  }
}