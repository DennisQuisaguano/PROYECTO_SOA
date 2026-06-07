import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { SucursalService } from '../core/services/sucursal.service';
import { NotificationService } from '../core/services/notification.service';
import { WebSocketService } from '../core/services/websocket.service';
import { Sucursal } from '../core/models/sucursal.model';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { VentaService } from '../core/services/venta.service';
import { first, interval, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ConfirmDialogModule],
  template: `
    <header class="uta-top-bar">
      <!-- Left -->
      <div class="uta-top-bar__left">
        <button class="topbar-menu-btn" (click)="toggleSidebar.emit()" style="margin-right: 15px;">
          <i class="bi bi-list"></i>
        </button>
        <div class="uta-status-pill" title="Conexión estable con el servidor">
          <span class="uta-status-dot uta-status-dot--pulse"></span>
          <span class="uta-status-text">Sistema En Línea</span>
        </div>
        
        <!-- Selector de Sucursal Unificado (Administrador/Bodeguero) -->
        <div class="sucursal-unified-selector" *ngIf="authService.isAdmin() || authService.isBodeguero()">
          <i class="bi bi-geo-alt-fill sucursal-icon"></i>
          <p-dropdown
            [options]="sucursales"
            [(ngModel)]="sucursalIdActiva"
            optionLabel="nombre"
            optionValue="id"
            (onChange)="cambiarSucursal($event)"
            placeholder="Sucursal"
            styleClass="topbar-sucursal-dropdown">
            <ng-template pTemplate="selectedItem">
                <span class="selected-label">SUCURSAL: {{ sucursalNombreActiva | uppercase }}</span>
            </ng-template>
          </p-dropdown>
        </div>

        <!-- Badge de Sucursal Estático (Cajero/Otros) -->
        <div class="sucursal-badge-top" *ngIf="!(authService.isAdmin() || authService.isBodeguero()) && sucursalNombreActiva">
          <i class="bi bi-geo-alt-fill"></i>
          <span>SUCURSAL: {{ sucursalNombreActiva | uppercase }}</span>
        </div>

        <!-- WebSocket connection indicator -->
      </div>

      <!-- Right -->
      <div class="uta-top-bar__right">
        <!-- Clock -->
        <div class="uta-clock-pill" title="Hora actual del sistema">
          <i class="bi bi-clock text-primary"></i>
          <span class="uta-clock-time">{{ currentTime }}</span>
        </div>

        <!-- Notifications -->
        <div class="uta-notification-wrapper" *ngIf="authService.isBodeguero()">
          <button class="uta-icon-btn uta-notification-btn" (click)="toggleNotifications()" title="Notificaciones">
            <i class="bi bi-bell"></i>
            <span class="uta-notification-badge" *ngIf="(notificationService.count$ | async) as count">
              {{ count > 0 ? count : '' }}
            </span>
          </button>
        </div>

        <div class="uta-divider-vertical"></div>

        <!-- User Profile and Logout -->
        <div class="uta-user-menu" (click)="confirmLogout()">
          <div class="uta-user-avatar">
            {{ userInitial }}
          </div>
          <div class="uta-user-info">
            <span class="uta-user-name">{{ authService.getUsername() }}</span>
            <span class="uta-user-role">{{ authService.getRol() }}</span>
          </div>
          <i class="bi bi-power uta-user-chevron text-danger" style="font-size: 1.15rem; margin-left: 5px;" title="Cerrar Sesión"></i>
        </div>
      </div>
    </header>

    <!-- Notification Dropdown (fuera del header) -->
    <div class="uta-notification-dropdown" *ngIf="showNotifications && authService.isBodeguero()">
      <div class="uta-notification-header">
        <span>Notificaciones ({{ (notificationService.count$ | async) || 0 }})</span>
        <button class="btn-close-sm" (click)="showNotifications = false">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="uta-notification-body">
        <ng-container *ngIf="(notificationService.solicitudes$ | async) as solicitudes">
          <div class="uta-notification-item" *ngFor="let sol of solicitudes.slice(0, 10)"
               [ngClass]="sol.estado === 'PENDIENTE' ? 'uta-notification-item--warning' : sol.estado === 'APROBADA' ? 'uta-notification-item--success' : 'uta-notification-item--danger'"
               (click)="irASolicitudes(); showNotifications = false">
            <div class="uta-notification-item__icon">
              <i class="bi" [ngClass]="sol.estado === 'PENDIENTE' ? 'bi-exclamation-triangle' : sol.estado === 'APROBADA' ? 'bi-check2-circle' : 'bi-x-circle'"></i>
            </div>
            <div class="uta-notification-item__content">
              <div class="uta-notification-item__title">Solicitud de Stock</div>
              <div class="uta-notification-item__text">{{ sol.productoNombre }} — {{ sol.cantidad }} unidades</div>
              <div class="uta-notification-item__time">Estado: {{ sol.estado }}</div>
            </div>
          </div>
          <div class="uta-notification-empty" *ngIf="solicitudes.length === 0">
            <i class="bi bi-check2-circle"></i>
            <span>No tienes notificaciones pendientes</span>
          </div>
        </ng-container>
      </div>
    </div>

    <!-- Overlay to close notifications -->
    <div class="notification-overlay" *ngIf="showNotifications" (click)="showNotifications = false"></div>

    <!-- ==================== LOCAL CONFIRM DIALOG ==================== -->
    <p-confirmDialog key="topbarActionDialog" [style]="{width: '450px'}" styleClass="premium-dialog"></p-confirmDialog>
  `,
  styles: [`
    .uta-top-bar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      height: 72px;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.02);
      z-index: 1001; /* Elevado para estar sobre el contenido principal */
      width: 100%;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }

    .uta-top-bar__left {
      display: flex;
      align-items: center;
    }

    .uta-top-bar__right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .topbar-menu-btn {
      width: 38px;
      height: 38px;
      border: none;
      background: #fdfcfc;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B1A33;
      font-size: 1.25rem;
      transition: all 0.2s;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .topbar-menu-btn:hover {
      background: #6B1A33;
      color: #fff;
    }

    /* Status Pill */
    .uta-status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2);
      padding: 0.4rem 1rem;
      border-radius: 20px;
      transition: all 0.2s ease;
    }

    .uta-status-pill:hover {
      background-color: rgba(34, 197, 94, 0.12);
    }

    .uta-status-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sucursal-badge-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(107, 26, 51, 0.04);
      border: 1px solid rgba(107, 26, 51, 0.15);
      padding: 0.4rem 1rem;
      border-radius: 8px;
      margin-left: 15px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #6B1A33;
      letter-spacing: 0.5px;
    }

    /* Selector Unificado (Dropdown + Badge Style) */
    .sucursal-unified-selector {
      display: flex;
      align-items: center;
      background-color: rgba(107, 26, 51, 0.04);
      border: 1px solid rgba(107, 26, 51, 0.15);
      border-radius: 8px;
      padding-left: 0.85rem;
      margin-left: 15px;
      transition: all 0.2s ease;
      height: 38px;
    }

    .sucursal-unified-selector:hover {
      background-color: rgba(107, 26, 51, 0.08);
      border-color: #6B1A33;
    }

    .sucursal-icon {
      color: #6B1A33;
      font-size: 0.95rem;
    }

    :host ::ng-deep .sucursal-unified-selector .topbar-sucursal-dropdown {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      min-width: 220px;
      height: 100%;
    }

    :host ::ng-deep .sucursal-unified-selector .topbar-sucursal-dropdown .p-dropdown-label {
      padding: 0 0.5rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #6B1A33;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
    }

    :host ::ng-deep .sucursal-unified-selector .topbar-sucursal-dropdown .p-dropdown-trigger {
      width: 2rem;
      color: #6B1A33;
    }

    .uta-status-dot {
      width: 6px;
      height: 6px;
      background-color: #22c55e;
      border-radius: 50%;
      position: relative;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
    }

    .uta-status-dot--pulse::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background-color: rgba(34, 197, 94, 0.4);
      border-radius: 50%;
      animation: uta-pulse 2s infinite;
    }

    @keyframes uta-pulse {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(2.4);
        opacity: 0;
      }
    }

    /* Clock Display */
    .uta-clock-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.4rem 1rem;
      border-radius: 10px;
      color: #475569;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .uta-clock-time {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
      font-variant-numeric: tabular-nums;
    }

    .text-primary {
      color: #6B1A33 !important;
    }

    /* PrimeNG Dropdown */
    :host ::ng-deep .topbar-sucursal-dropdown .p-dropdown {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.82rem;
      min-width: 180px;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    :host ::ng-deep .topbar-sucursal-dropdown .p-dropdown:hover {
      border-color: #6B1A33;
    }

    /* Notifications */
    .uta-notification-wrapper {
      position: relative;
    }

    .uta-icon-btn {
      background: transparent;
      border: 1px solid transparent;
      color: #64748b;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .uta-icon-btn:hover {
      background-color: #f8fafc;
      border-color: #e2e8f0;
      color: #6B1A33;
    }

    .uta-notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .uta-notification-dropdown {
      position: fixed;
      top: 80px;
      right: 24px;
      width: 420px;
      max-width: calc(100vw - 48px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      z-index: 9999;
      overflow: visible;
      animation: uta-dropdown-in 0.2s ease-out;
    }

    @keyframes uta-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .notification-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 998;
      background: transparent;
    }

    .uta-notification-header {
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #5A1428 0%, #8b2342 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 0.95rem;
      border-bottom: none;
    }

    .btn-close-sm {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-close-sm:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .uta-notification-body {
      padding: 0.6rem;
      max-height: 380px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .uta-notification-body::-webkit-scrollbar {
      width: 6px;
    }

    .uta-notification-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .uta-notification-body::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .uta-notification-body::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    .uta-notification-item {
      display: flex;
      gap: 0.8rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      border-radius: 10px;
      background: #fafbfc;
      margin: 0;
    }

    .uta-notification-item:hover {
      background-color: #f3f4f6;
      border-color: #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .uta-notification-item__icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 10px;
      background-color: #fff7ed;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .uta-notification-item--warning .uta-notification-item__icon {
      background-color: #fef3c7;
      color: #d97706;
    }

    .uta-notification-item--success .uta-notification-item__icon {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .uta-notification-item--danger .uta-notification-item__icon {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .uta-notification-item__content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .uta-notification-item__title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
      margin-bottom: 0.25rem;
    }

    .uta-notification-item__text {
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.3;
      margin: 0;
      margin-bottom: 0.2rem;
      white-space: normal;
      word-break: break-word;
    }

    .uta-notification-item__time {
      font-size: 0.7rem;
      font-weight: 600;
      color: #9ca3af;
      display: block;
      margin: 0;
    }

    .uta-notification-empty {
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      color: #9ca3af;
    }

    .uta-notification-empty i {
      font-size: 2rem;
      opacity: 0.6;
      color: #d1d5db;
    }

    .uta-notification-empty span {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .uta-divider-vertical {
      width: 1px;
      height: 24px;
      background-color: #e2e8f0;
    }

    /* User Profile Menu */
    .uta-user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.4rem 0.6rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .uta-user-menu:hover {
      background-color: #f8fafc;
      border-color: #e2e8f0;
    }

    .uta-user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #8A1538, #6B1A33);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      box-shadow: 0 2px 4px rgba(107, 26, 51, 0.15);
    }

    .uta-user-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .uta-user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 2px;
    }

    .uta-user-role {
      font-size: 0.7rem;
      font-weight: 500;
      color: #64748b;
    }

    .uta-user-chevron {
      font-size: 1.1rem;
      color: #dc2626;
      transition: transform 0.2s ease;
      margin-left: 0.25rem;
    }

    .uta-user-menu:hover .uta-user-chevron {
      transform: scale(1.15);
    }

    @media (max-width: 768px) {
      .uta-top-bar {
        padding: 0 1rem;
      }
      .uta-clock-pill,
      .uta-user-info {
        display: none;
      }
      .uta-notification-dropdown {
        width: calc(100vw - 2rem);
        max-width: 380px;
        right: 1rem;
      }
      .uta-notification-body {
        max-height: 300px;
      }
    }
  `]
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  @Input() sidebarVisible = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  wsService = inject(WebSocketService);
  private sucursalService = inject(SucursalService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private ventaService = inject(VentaService);
  private destroy$ = new Subject<void>();

  isConnected$: Observable<boolean> = this.wsService.isConnected();

  reconnectWs() {
    this.wsService.connect();
  }

  sucursales: Sucursal[] = [];
  sucursalIdActiva: string = '';
  sucursalNombreActiva: string = '';
  currentTime: string = '';
  showNotifications = false;

  get userInitial(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  ngOnInit() {
    this.sucursalService.obtenerTodas().subscribe(data => {
      this.sucursales = data;
      this.actualizarNombreSucursal();
    });
    this.authService.sucursalActiva$.subscribe(id => {
      if (id) {
        this.sucursalIdActiva = id;
        this.actualizarNombreSucursal();
      }
    });

    this.updateClock();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateClock());
  }

  private actualizarNombreSucursal() {
    if (this.sucursalIdActiva && this.sucursales.length > 0) {
      const suc = this.sucursales.find(s => s.id === this.sucursalIdActiva);
      this.sucursalNombreActiva = suc ? suc.nombre : '';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  irASolicitudes() {
    this.router.navigate(['/inventario/solicitudes']);
  }

  cambiarSucursal(event: any) {
    this.ventaService.ventaEnCurso$.pipe(first()).subscribe(enCurso => {
      if (enCurso) {
        this.confirmationService.confirm({
          key: 'topbarActionDialog',
          header: 'Cambio Bloqueado',
          message: 'Hay una venta en curso. Debe finalizarla o cancelarla antes de cambiar de sucursal.',
          icon: 'pi pi-lock',
          rejectVisible: false,
          acceptLabel: 'ENTENDIDO',
          acceptButtonStyleClass: 'p-button-primary p-button-raised',
          accept: () => {
            this.authService.sucursalActiva$.pipe(first()).subscribe(id => {
              if (id) this.sucursalIdActiva = id;
            });
          }
        });
        return;
      }

      const sucursalNueva = this.sucursales.find(s => s.id === this.sucursalIdActiva);
      const nombreSucursal = sucursalNueva ? sucursalNueva.nombre : 'seleccionada';

      this.confirmationService.confirm({
        key: 'topbarActionDialog',
        header: 'Confirmar Cambio de Sucursal',
        message: `¿Está seguro que desea cambiar a la sucursal <b>${nombreSucursal}</b>? Se recargarán los datos operativos.`,
        icon: 'pi pi-exclamation-circle',
        acceptLabel: 'SÍ, CAMBIAR',
        rejectLabel: 'CANCELAR',
        acceptButtonStyleClass: 'p-button-primary p-button-raised',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        accept: () => {
          this.authService.setSucursalActiva(this.sucursalIdActiva);
          window.location.reload();
        },
        reject: () => {
          this.authService.sucursalActiva$.pipe(first()).subscribe(id => {
            if (id) this.sucursalIdActiva = id;
          });
        }
      });
    });
  }

  confirmLogout() {
    this.confirmationService.confirm({
      key: 'topbarActionDialog',
      header: 'Cerrar Sesión',
      message: '¿Está seguro que desea salir del sistema?',
      icon: 'pi pi-power-off',
      acceptLabel: 'SÍ, SALIR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.authService.logout();
      }
    });
  }
}