import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-select-sucursal',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, DropdownModule],
  template: `
    <div class="uta-bg-wrapper">
      <div class="uta-login-container">
        <div class="uta-login-card">
          
          <!-- Header with Logo -->
          <div class="uta-login-header">
            <div class="uta-login-logo">
              <i class="bi bi-geo-alt"></i>
            </div>
            <h1 class="uta-login-title">Seleccione Sucursal</h1>
            <p class="uta-login-subtitle">Bienvenido de vuelta, <span class="username-highlight">{{username}}</span></p>
          </div>

          <!-- Form Section -->
          <div class="flex flex-column gap-4">
            <div class="uta-form-group">
              <label class="uta-form-label">Punto de Emisión</label>
              <div class="custom-dropdown">
                <p-dropdown [options]="sucursales" [(ngModel)]="selectedSucursalId" 
                            optionLabel="nombre" optionValue="id"
                            placeholder="Elija una sucursal para operar" 
                            styleClass="w-full"></p-dropdown>
              </div>
            </div>
            
            <button pButton label="INGRESAR AHORA" icon="pi pi-check" 
                    class="uta-login-btn w-full" 
                    [disabled]="!selectedSucursalId"
                    (click)="confirmar()"></button>
            
            <div class="secure-footer">
              <i class="bi bi-shield-lock-fill"></i>
              <span>Acceso de operador seguro</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <style>
      .uta-bg-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background-color: #f8fafc;
        background-image: radial-gradient(at 100% 0%, rgba(107, 26, 51, 0.04) 0px, transparent 50%),
                          radial-gradient(at 0% 100%, rgba(107, 26, 51, 0.03) 0px, transparent 50%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        overflow: hidden;
      }

      .uta-login-container {
        width: 100%;
        max-width: 440px;
        padding: 1.5rem;
        position: relative;
        z-index: 10;
      }

      .uta-login-card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01), 0 20px 40px rgba(107, 26, 51, 0.02);
        padding: 3rem 2.5rem;
        border: 1px solid rgba(107, 26, 51, 0.06);
        animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .uta-login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .uta-login-logo {
        width: 60px;
        height: 60px;
        background: rgba(107, 26, 51, 0.04);
        color: #6B1A33;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        margin: 0 auto 1.25rem;
        border: 1px solid rgba(107, 26, 51, 0.1);
        box-shadow: 0 4px 12px rgba(107, 26, 51, 0.05);
      }

      .uta-login-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.5px;
      }

      .uta-login-subtitle {
        font-size: 0.88rem;
        color: #64748b;
        margin: 8px 0 0 0;
        font-weight: 500;
      }

      .username-highlight {
        color: #6B1A33;
        font-weight: 700;
      }

      .uta-form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .uta-form-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #475569;
      }

      /* PrimeNG Dropdown styling overrides */
      :host ::ng-deep .custom-dropdown .p-dropdown {
        width: 100%;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 2px 4px;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }

      :host ::ng-deep .custom-dropdown .p-dropdown:not(.p-disabled):hover {
        border-color: #cbd5e1;
      }

      :host ::ng-deep .custom-dropdown .p-dropdown.p-focus {
        border-color: #6B1A33;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(107, 26, 51, 0.1);
      }

      :host ::ng-deep .custom-dropdown .p-dropdown .p-dropdown-label {
        padding: 10px 14px;
        font-size: 0.92rem;
        color: #1e293b;
      }

      :host ::ng-deep .custom-dropdown .p-dropdown .p-dropdown-label.p-placeholder {
        color: #94a3b8;
      }

      :host ::ng-deep .custom-dropdown .p-dropdown .p-dropdown-trigger {
        width: 3rem;
        color: #64748b;
      }

      /* Submit Button */
      .uta-login-btn {
        background: #6B1A33 !important;
        border: none !important;
        color: #fff !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        padding: 12px 24px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        box-shadow: 0 4px 12px rgba(107, 26, 51, 0.15) !important;
        margin-top: 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        height: auto !important;
      }

      .uta-login-btn:hover:not(:disabled) {
        background: #5A1428 !important;
        box-shadow: 0 6px 16px rgba(107, 26, 51, 0.3) !important;
        transform: translateY(-1px) !important;
      }

      .uta-login-btn:disabled {
        background: #e2e8f0 !important;
        color: #94a3b8 !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
      }

      /* Secure SSL Footer */
      .secure-footer {
        margin-top: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #94a3b8;
        font-size: 0.78rem;
        font-weight: 500;
      }

      .secure-footer i {
        color: #22c55e;
        font-size: 0.9rem;
        margin-right: 4px;
      }

      @media (max-width: 576px) {
        .uta-login-container {
          padding: 1rem;
        }
        
        .uta-login-card {
          padding: 2.5rem 1.5rem;
        }
      }
    </style>
  `
})
export class SelectSucursalComponent implements OnInit {
  private authService = inject(AuthService);
  private sucursalService = inject(SucursalService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  username = '';
  sucursales: Sucursal[] = [];
  selectedSucursalId: string | null = null;

  ngOnInit() {
    this.username = this.authService.getUsername() || 'Usuario';
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.sucursalService.obtenerTodas().subscribe({
      next: (data: Sucursal[]) => {
        // Restaurado: Todos ven todas las sucursales
        this.sucursales = data;
        
        const userSucursalId = sessionStorage.getItem('sucursalId');
        if (userSucursalId && data.some(s => s.id === userSucursalId)) {
          this.selectedSucursalId = userSucursalId;
        }
      }
    });
  }

  confirmar() {
    if (this.selectedSucursalId) {
      this.authService.setSucursalActiva(this.selectedSucursalId);
      const rol = this.authService.getRol();
      window.location.href = rol === 'BODEGUERO' ? '/inventario' : '/dashboard';
    }
  }
}
