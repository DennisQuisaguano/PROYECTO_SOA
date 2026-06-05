import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InventarioService } from '../../../core/services/inventario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-bodega-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, ButtonModule, MonedaPipe],
  template: `
    <div class="uta-page" style="padding: 0;">
      <!-- Metricas Unificadas -->
      <div class="uta-stats-row mb-4">
        <div class="uta-stat-card uta-stat-card--light" (click)="router.navigate(['/inventario'])" style="cursor:pointer">
            <div class="uta-stat-card__icon text-danger"><i class="bi bi-exclamation-triangle"></i></div>
            <div class="uta-stat-card__details">
                <div class="uta-stat-card__number">{{stockCritico.length}}</div>
                <div class="uta-stat-card__label">Items Stock Crítico</div>
            </div>
        </div>
        <div class="uta-stat-card uta-stat-card--light" (click)="router.navigate(['/inventario/solicitudes'])" style="cursor:pointer">
            <div class="uta-stat-card__icon text-primary"><i class="bi bi-envelope-exclamation"></i></div>
            <div class="uta-stat-card__details">
                <div class="uta-stat-card__number">{{pendientesCount}}</div>
                <div class="uta-stat-card__label">Trámites Pendientes</div>
            </div>
        </div>
        <div class="uta-stat-card uta-stat-card--dark">
            <div class="uta-stat-card__icon"><i class="bi bi-shop"></i></div>
            <div class="uta-stat-card__details">
                <div class="uta-stat-card__number">ACTIVA</div>
                <div class="uta-stat-card__label">Sucursal Bodega</div>
            </div>
        </div>
      </div>

      <div class="grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <!-- Tabla Stock Bajo -->
        <div class="uta-card">
          <div class="uta-card__header">
            <div class="uta-card__header-left">
                <i class="bi bi-list-stars uta-card__header-icon"></i>
                Alertas de Reabastecimiento
            </div>
          </div>
          <div class="uta-card__body p-0">
            <div class="uta-table-wrap">
                <table class="uta-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th class="text-center">Existencias</th>
                      <th class="text-center">Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of stockCritico" class="hover:bg-gray-50">
                      <td class="uta-table__bold">{{item.productoNombre}}</td>
                      <td><span class="uta-badge uta-badge--light">{{item.categoriaNombre}}</span></td>
                      <td class="text-center font-black" [class.text-danger]="item.stock < 5">{{item.stock}}</td>
                      <td class="text-center">
                        <span class="uta-badge" [ngClass]="item.stock === 0 ? 'uta-badge--red' : 'uta-badge--yellow'">
                          {{item.stock === 0 ? 'AGOTADO' : 'BAJO'}}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="stockCritico.length === 0">
                      <td colspan="4" class="uta-table__empty">No hay alertas de stock bajo</td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos -->
        <div class="uta-card">
          <div class="uta-card__header">
            <div class="uta-card__header-left">
                <i class="bi bi-lightning-charge uta-card__header-icon"></i>
                Gestión Operativa
            </div>
          </div>
          <div class="uta-card__body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="uta-btn uta-btn--primary w-100" (click)="router.navigate(['/inventario'])">
                <i class="bi bi-plus-circle"></i> REGISTRAR INGRESO
            </button>
            <button class="uta-btn uta-btn--outline w-100" (click)="router.navigate(['/inventario/solicitudes'])">
                <i class="bi bi-truck"></i> VER TRASLADOS
            </button>
            
            <div class="mt-3 p-3 rounded-3" style="background-color: #f8fafc; border: 1px dashed #cbd5e1;">
              <h4 class="m-0 mb-2" style="font-weight: 700; color: #1e293b; font-size: 0.85rem; text-transform: uppercase;">Rol del Bodeguero</h4>
              <ul class="text-600 pl-3 m-0" style="padding-left: 1.25rem; font-size: 0.75rem; color: #64748b; line-height: 1.5;">
                <li>Autoriza traslados de mercadería.</li>
                <li>Registra facturas de proveedores.</li>
                <li>Asegura la disponibilidad del catálogo.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BodegaDashboardComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  router = inject(Router);

  stockCritico: any[] = [];
  pendientesCount = 0;

  ngOnInit() {
    this.loadData();
    this.notificationService.count$.subscribe(count => this.pendientesCount = count);
  }

  loadData() {
    const sucursalId = this.authService.getSucursalId();
    if (sucursalId) {
      this.inventarioService.findBySucursalId(sucursalId).subscribe((data: any[]) => {
        this.stockCritico = data.filter((i: any) => i.stock < 10);
      });
    }
  }
}
