import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private sucursalActivaSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('sucursalId'));
  sucursalActiva$ = this.sucursalActivaSubject.asObservable();

  login(request: LoginRequest): Observable<AuthResponse> {
    // Limpieza total antes de loguear un nuevo usuario para evitar mezcla de roles
    sessionStorage.clear();
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('username', response.username);
        sessionStorage.setItem('rol', response.rol);
        sessionStorage.setItem('nombreCompleto', response.nombreCompleto);
        sessionStorage.setItem('userId', response.userId);
        
        if (response.sucursalId) {
          this.setSucursalActiva(response.sucursalId);
        } else {
          this.setSucursalActiva('SUC001');
        }
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/select-sucursal']);
      })
    );
  }

  setSucursalActiva(id: string) {
    sessionStorage.setItem('sucursalId', id);
    this.sucursalActivaSubject.next(id);
  }

  logout(): void {
    sessionStorage.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getRol(): string | null {
    return sessionStorage.getItem('rol');
  }

  getUsername(): string | null {
    return sessionStorage.getItem('username');
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getSucursalId(): string | null {
    return sessionStorage.getItem('sucursalId');
  }

  isAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  isCajero(): boolean {
    return this.getRol() === 'CAJERO';
  }

  isBodeguero(): boolean {
    const rol = this.getRol();
    return rol === 'BODEGUERO' || rol === 'BODEGERO';
  }

  hasAnyRole(roles: string[]): boolean {
    const userRol = this.getRol();
    return userRol ? roles.includes(userRol) : false;
  }
}