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
    <div class="flex align-items-center justify-content-center min-h-screen bg-layout-grid p-4">
      <div class="glass-card p-6 shadow-8 border-round-xl fadein animation-duration-500" style="width: 100%; max-width: 450px;">
        <div class="text-center mb-5">
            <div class="inline-flex align-items-center justify-content-center logo-circle mb-3" style="width: 80px; height: 80px;">
                <i class="bi bi-geo-alt text-4xl"></i>
            </div>
            <h2 class="text-900 font-bold m-0" style="font-family: 'Inter', sans-serif;">Seleccione sucursal</h2>
            <p class="text-600 mt-2">Bienvenido, <span class="username-highlight font-semibold">{{username}}</span></p>
        </div>
        
        <div class="flex flex-column gap-4">
          <div class="flex flex-column gap-2">
            <label class="font-medium text-700" style="font-size: 0.88rem; font-weight: 600;">Punto de Emisión</label>
            <p-dropdown [options]="sucursales" [(ngModel)]="selectedSucursalId" 
                        optionLabel="nombre" optionValue="id"
                        placeholder="Elija una sucursal para operar" 
                        styleClass="w-full custom-dropdown"></p-dropdown>
          </div>
          
          <button pButton label="INGRESAR AHORA" icon="pi pi-check" 
                  class="w-full p-button-lg p-button-raised border-round-lg p-3 text-xl font-bold uta-login-btn" 
                  [disabled]="!selectedSucursalId"
                  (click)="confirmar()"></button>
          
          <div class="text-center mt-2">
            <span class="text-400 text-xs uppercase tracking-wider">Sistema de Gestión de Ventas v2.0</span>
          </div>
        </div>
      </div>
    </div>

    <style>
      .bg-layout-grid {
        background-color: #fdfcfc;
        background-image: radial-gradient(at 100% 0%, rgba(107, 26, 51, 0.04) 0px, transparent 50%),
                          radial-gradient(at 0% 100%, rgba(107, 26, 51, 0.02) 0px, transparent 50%);
      }
      .glass-card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.03);
      }
      .logo-circle {
        background: #fdf5f7;
        color: #6B1A33;
        border-radius: 14px;
        border: 1px solid #fae6ec;
      }
      .username-highlight {
        color: #6B1A33;
      }
      :host ::ng-deep .custom-dropdown .p-dropdown {
        background: #ffffff;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      :host ::ng-deep .custom-dropdown .p-dropdown:hover {
        border-color: #6B1A33;
      }
      .uta-login-btn {
        background: #6B1A33 !important;
        border: none !important;
        color: #ffffff !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 4px rgba(107, 26, 51, 0.1) !important;
      }
      .uta-login-btn:hover:not(:disabled) {
        background: #8b2041 !important;
        box-shadow: 0 4px 8px rgba(107, 26, 51, 0.15) !important;
        transform: translateY(-1px) !important;
      }
      .uta-login-btn:disabled {
        background: #e5e7eb !important;
        color: #9ca3af !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
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
        // Permitir a TODOS ver TODAS las sucursales según nuevo requerimiento
        this.sucursales = data;
        
        // Intentar pre-seleccionar la sucursal del usuario si existe
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
