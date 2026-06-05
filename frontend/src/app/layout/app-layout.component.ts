import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppTopBarComponent } from './app-topbar.component';
import { AppSidebarComponent } from './app-sidebar.component';
import { AuthService } from '../core/services/auth.service';
import { RealtimeNotificationService } from '../core/services/realtime-notification.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppTopBarComponent, AppSidebarComponent, ToastModule],
  templateUrl: './app-layout.component.html',
  providers: [MessageService]
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  sidebarVisible = true;

  ngOnInit(): void {
    const sucursalId = this.authService.getSucursalId();
    if (sucursalId) {
      this.realtimeNotificationService.inicializarParaSucursal(sucursalId);
    }

    this.realtimeNotificationService.onAlertaStock()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evento => {
        if (evento.nivelAlerta === 'AGOTADO') {
          this.messageService.add({
            severity: 'error',
            summary: '¡AGOTADO!',
            detail: `${evento.productoNombre} se quedó sin stock`,
            sticky: true,
            life: 8000
          });
        } else if (evento.nivelAlerta === 'CRITICO') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stock crítico',
            detail: `${evento.productoNombre} tiene solo ${evento.stockActual} unidades`,
            life: 6000
          });
        } else if (evento.nivelAlerta === 'BAJO') {
          this.messageService.add({
            severity: 'info',
            summary: 'Stock bajo',
            detail: `${evento.productoNombre} tiene ${evento.stockActual} unidades`,
            life: 4000
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.realtimeNotificationService.desconectar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}