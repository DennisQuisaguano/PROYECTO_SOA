import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar-container">
      <!-- Logo -->
      <div class="uta-brand-header">
        <a class="uta-brand-text" routerLink="/">
          <i class="bi bi-shop uta-brand-icon text-warning"></i>
          <span *ngIf="!collapsed">MI NEGOCIO</span>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav uta-nav">
        <!-- PRINCIPAL -->
        <div class="nav-section">
          <span class="nav-section-label" *ngIf="!collapsed">PRINCIPAL</span>
          <a routerLink="/dashboard" routerLinkActive="active" class="uta-nav-link">
            <div class="uta-menu-icon">
              <i class="bi bi-house-door"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Panel de Control</span>
          </a>
        </div>

        <!-- OPERACIONES -->
        <div class="nav-section" *ngIf="authService.hasAnyRole(['ADMIN', 'CAJERO'])">
          <span class="nav-section-label" *ngIf="!collapsed">OPERACIONES</span>
          <a routerLink="/ventas/nueva" routerLinkActive="active" class="uta-nav-link" *ngIf="authService.isCajero()">
            <div class="uta-menu-icon">
              <i class="bi bi-cart3"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Punto de Venta</span>
          </a>
          <a routerLink="/ventas/historial" routerLinkActive="active" class="uta-nav-link">
            <div class="uta-menu-icon">
              <i class="bi bi-receipt"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Facturación</span>
          </a>
        </div>

        <!-- CATÁLOGOS -->
        <div class="nav-section" *ngIf="authService.hasAnyRole(['ADMIN', 'CAJERO'])">
          <span class="nav-section-label" *ngIf="!collapsed">CATÁLOGOS</span>
          <a routerLink="/clientes" routerLinkActive="active" class="uta-nav-link" *ngIf="authService.hasAnyRole(['ADMIN', 'CAJERO'])">
            <div class="uta-menu-icon">
              <i class="bi bi-people"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Clientes</span>
          </a>
          <a routerLink="/productos" routerLinkActive="active" class="uta-nav-link" *ngIf="authService.hasAnyRole(['ADMIN', 'BODEGUERO'])">
            <div class="uta-menu-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Catálogo de Productos</span>
          </a>
          <a routerLink="/usuarios" routerLinkActive="active" class="uta-nav-link" *ngIf="authService.isAdmin()">
            <div class="uta-menu-icon">
              <i class="bi bi-person-gear"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Usuarios y Accesos</span>
          </a>
        </div>

        <!-- LOGÍSTICA -->
        <div class="nav-section" *ngIf="authService.hasAnyRole(['BODEGUERO'])">
          <span class="nav-section-label" *ngIf="!collapsed">LOGÍSTICA</span>
          <a routerLink="/inventario" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="uta-nav-link">
            <div class="uta-menu-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Control de Inventario</span>
          </a>
          <a routerLink="/inventario/solicitudes" routerLinkActive="active" class="uta-nav-link">
            <div class="uta-menu-icon">
              <i class="bi bi-arrow-left-right"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Traslados por Aprobar</span>
          </a>
          <a routerLink="/inventario/historial" routerLinkActive="active" class="uta-nav-link">
            <div class="uta-menu-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Historial de Movimientos</span>
          </a>
        </div>

        <!-- CUENTA -->
        <div class="nav-section nav-section-bottom">
          <span class="nav-section-label" *ngIf="!collapsed">CUENTA</span>
          <a class="uta-nav-link text-danger-hover" (click)="logout()">
            <div class="uta-menu-icon">
              <i class="bi bi-box-arrow-left text-danger"></i>
            </div>
            <span class="uta-menu-text" *ngIf="!collapsed">Cerrar Sesión</span>
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <i class="bi bi-info-circle"></i>
        <span>Versión 2.0.0</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(145deg, #8b2342 0%, #6B1A33 45%, #3a0d1b 100%) !important;
      border-right: 1px solid rgba(0, 0, 0, 0.3);
      box-shadow: inset -2px 0 10px rgba(0, 0, 0, 0.15);
      font-family: 'Inter', sans-serif;
    }

    .uta-brand-header {
      background: rgba(0, 0, 0, 0.2) !important;
      backdrop-filter: blur(5px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      height: 72px;
    }

    .uta-brand-text {
      font-weight: 800 !important;
      font-size: 1.15rem !important;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      line-height: 1;
      text-decoration: none;
      color: white !important;
    }

    .uta-brand-icon {
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      line-height: 1;
      filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
      transform: translateY(-2px);
    }

    .text-warning {
      color: #f97316 !important;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .nav-section {
      margin-bottom: 0.8rem;
    }

    .nav-section-bottom {
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1rem;
    }

    .nav-section-label {
      display: block;
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 0.5rem 1.5rem 0.5rem;
      text-transform: uppercase;
    }

    .uta-nav-link {
      color: rgba(255, 255, 255, 0.75) !important;
      border-radius: 10px;
      margin: 0.3rem 0.8rem;
      padding: 0.75rem 1rem !important;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      border: 1px solid transparent;
      text-decoration: none;
      cursor: pointer;
    }

    .uta-nav-link:hover:not(.active) {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #ffffff !important;
    }

    .uta-nav-link.active {
      background: linear-gradient(145deg, #ffffff 0%, #f4f6f9 100%) !important;
      color: #6B1A33 !important;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .uta-nav-link.active i {
      color: #6B1A33 !important;
    }

    .uta-menu-icon {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      transition: transform 0.3s ease;
    }

    .uta-nav-link:hover .uta-menu-icon {
      transform: scale(1.1);
    }

    .uta-menu-text {
      margin-top: 1px;
    }

    .text-danger-hover:hover {
      background-color: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
      border-color: rgba(239, 68, 68, 0.2) !important;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.25);
    }
  `]
})
export class AppSidebarComponent implements OnInit {
  @Input() collapsed = false;
  authService = inject(AuthService);

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}