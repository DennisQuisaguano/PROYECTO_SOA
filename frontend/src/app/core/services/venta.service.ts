import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaRequest, VentaResponse } from '../models/venta.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;
  
  private ventaEnCursoSubject = new BehaviorSubject<boolean>(false);
  ventaEnCurso$ = this.ventaEnCursoSubject.asObservable();

  setVentaEnCurso(estado: boolean) {
    this.ventaEnCursoSubject.next(estado);
  }

  crearVenta(request: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.apiUrl, request);
  }

  findById(id: string): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`);
  }

  obtenerTodas(page = 0, size = 10): Observable<Page<VentaResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<VentaResponse>>(this.apiUrl, { params });
  }

  findBySucursalId(sucursalId: string, page = 0, size = 10): Observable<Page<VentaResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<VentaResponse>>(`${this.apiUrl}/sucursal/${sucursalId}`, { params });
  }

  findByFechaBetween(desde: string, hasta: string): Observable<VentaResponse[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/fecha`, { params });
  }

  anularVenta(id: string): Observable<VentaResponse> {
    return this.http.put<VentaResponse>(`${this.apiUrl}/${id}/anular`, {});
  }

  descargarFacturaPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/factura`, { responseType: 'blob' });
  }
}