import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, interval, switchMap, startWith, of } from 'rxjs';
import { SolicitudStockService } from './solicitud-stock.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private solicitudService = inject(SolicitudStockService);
  private authService = inject(AuthService);

  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  private solicitudesSubject = new BehaviorSubject<any[]>([]);
  solicitudes$ = this.solicitudesSubject.asObservable();

  constructor() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startPolling();
      }
    });
  }

  private startPolling() {
    // Polling cada 3 segundos para una experiencia casi instantánea
    interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.authService.isBodeguero()) {
            return this.solicitudService.listar();
          }
          return of([]);
        })
      )
      .subscribe({
        next: (solicitudes) => this.updateData(solicitudes),
        error: () => {} // Ignorar errores de polling para no ensuciar consola
      });
  }

  private updateData(solicitudes: any[]) {
    let filtradas = solicitudes;
    
    // Si es Bodeguero, filtrar solo las de su sucursal de origen
    if (this.authService.isBodeguero()) {
      const sucursalId = this.authService.getSucursalId();
      filtradas = solicitudes.filter(s => s.sucursalOrigenId === sucursalId);
    } else {
      filtradas = [];
    }

    const pendientes = filtradas.filter(s => s.estado === 'PENDIENTE').length;
    this.countSubject.next(pendientes);
    this.solicitudesSubject.next(filtradas);
  }

  refresh() {
    this.solicitudService.listar().subscribe(solicitudes => {
      this.updateData(solicitudes);
    });
  }
}