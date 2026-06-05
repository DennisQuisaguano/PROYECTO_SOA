import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MovimientoInventario {
  id: string;
  sucursalNombre: string;
  productoNombre: string;
  cantidad: number;
  tipo: string;
  motivo: string;
  fecha: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventarios/movimientos`;

  listarPorSucursal(sucursalId: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<any>(`${this.apiUrl}/sucursal/${sucursalId}`, { params });
  }
}
