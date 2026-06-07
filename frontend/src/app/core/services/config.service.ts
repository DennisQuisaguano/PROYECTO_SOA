import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/config`;

  getConfig(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateIva(ivaPorcentaje: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/iva`, { ivaPorcentaje });
  }
}