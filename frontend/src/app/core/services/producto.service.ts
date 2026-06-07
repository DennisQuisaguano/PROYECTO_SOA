import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoRequest } from '../models/producto.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  findAll(page = 0, size = 10): Observable<Page<Producto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Producto>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  buscar(nombre: string, categoriaId?: string): Observable<Producto[]> {
    let params = new HttpParams().set('nombre', nombre);
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId);
    }
    return this.http.get<Producto[]>(`${this.apiUrl}/buscar`, { params });
  }

  obtenerPorCategoria(categoriaId: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  crear(request: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, request);
  }

  actualizar(id: string, request: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}