import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoInventarioService, MovimientoInventario } from '../../../core/services/movimiento-inventario.service';
import { AuthService } from '../../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { FechaHoraPipe } from '../../../shared/pipes/fecha-hora.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movimientos-historial',
  standalone: true,
  imports: [CommonModule, TableModule, FechaHoraPipe],
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <i class="pi pi-history"></i>
        </div>
        <div>
          <h1 class="page-title">Historial de Movimientos (Kardex)</h1>
          <p class="page-subtitle">Monitoree las entradas, salidas y transferencias de mercadería de esta sucursal</p>
        </div>
      </div>
    </div>

    <!-- ==================== KPI CARDS ==================== -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--purple">
          <i class="pi pi-history"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ getTotalMovimientos() }}</span>
          <span class="kpi-label">Total Movimientos</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <i class="pi pi-plus-circle"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ getIngresosCount() }}</span>
          <span class="kpi-label">Ingresos de Bodega</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--orange">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ getVentasCount() }}</span>
          <span class="kpi-label">Salidas por Venta</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--blue">
          <i class="pi pi-sync"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ getTrasladosCount() }}</span>
          <span class="kpi-label">Traslados de Bodega</span>
        </div>
      </div>
    </div>

    <!-- ==================== TABLE SECTION ==================== -->
    <div class="table-container">
      <div class="table-header-wine">
        <h2 class="table-title-wine">
          <i class="pi pi-list mr-2"></i> LISTADO DE MOVIMIENTOS
        </h2>
      </div>

      <p-table [value]="movimientos" [loading]="loading" [paginator]="true" [rows]="15"
               styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 70px; text-align: center;">N°</th>
            <th>Fecha y Hora</th>
            <th>Producto</th>
            <th class="text-center">Tipo</th>
            <th class="text-center" style="width: 100px;">Cantidad</th>
            <th>Motivo / Justificación</th>
            <th class="text-center">Responsable</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-mov let-rowIndex="rowIndex">
          <tr>
            <td style="text-align: center;" class="row-index-cell">
              {{ rowIndex + 1 }}
            </td>
            <td style="color: #64748b; font-weight: 500;">
              <i class="pi pi-calendar" style="font-size: 0.85rem; margin-right: 6px; color: #94a3b8;"></i>
              {{ mov.fecha | fechaHora }}
            </td>
            <td class="font-bold uppercase-name" style="color: #1e293b;">
              {{ mov.productoNombre }}
            </td>
            <td class="text-center">
              <span class="uta-badge" [ngClass]="{
                'uta-badge--green': mov.tipo === 'INGRESO',
                'uta-badge--red': mov.tipo === 'BAJA',
                'uta-badge--blue': mov.tipo === 'TRASLADO',
                'uta-badge--orange': mov.tipo === 'VENTA'
              }">
                <i class="pi" [ngClass]="{
                  'pi-plus-circle': mov.tipo === 'INGRESO',
                  'pi-times-circle': mov.tipo === 'BAJA',
                  'pi-sync': mov.tipo === 'TRASLADO',
                  'pi-shopping-cart': mov.tipo === 'VENTA'
                }" style="font-size: 0.75rem; margin-right: 6px;"></i>
                {{ mov.tipo }}
              </span>
            </td>
            <td class="text-center">
              <span class="font-bold" style="font-size: 0.95rem; color: #1e293b;">
                {{ Math.abs(mov.cantidad) }}
              </span>
            </td>
            <td style="color: #475569; font-weight: 500;">
              {{ mov.motivo }}
            </td>
            <td class="text-center">
              <span class="uta-code-badge">{{ '@' }}{{ mov.username }}</span>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" style="padding: 60px; text-align: center; color: #94a3b8;">
              <i class="pi pi-history" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
              <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">No se registraron movimientos en esta sucursal</p>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* ==================== PAGE HEADER ==================== */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .page-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-header-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #6B1A33;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.4rem;
      box-shadow: 0 4px 15px rgba(107, 26, 51, 0.25);
    }

    .page-title {
      font-size: 1.65rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.88rem;
      color: #64748b;
      margin: 4px 0 0 0;
    }

    /* ==================== KPI CARDS ==================== */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid #e2e8f0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.04);
    }

    .kpi-icon {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .kpi-icon--purple { background: #faf5ff; color: #7c3aed; }
    .kpi-icon--green { background: #e8f8ef; color: #16a34a; }
    .kpi-icon--orange { background: #fffbeb; color: #d97706; }
    .kpi-icon--blue { background: #eff6ff; color: #2563eb; }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }

    .kpi-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }

    .kpi-label {
      font-size: 0.76rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    /* ==================== TABLE SECTION ==================== */
    .table-container {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid #e2e8f0;
    }

    .table-header-wine {
      padding: 12px 20px;
      background-color: #6B1A33;
      border-bottom: 1px solid #5a1428;
    }

    .table-title-wine {
      font-weight: 700;
      font-size: 0.95rem;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    /* Row elements */
    .row-index-cell {
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .uppercase-name {
      text-transform: uppercase;
      font-weight: 700;
      font-size: 0.9rem;
    }

    /* Badges */
    .uta-badge {
      display: inline-flex;
      align-items: center;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      width: 105px;
      justify-content: center;
    }

    .uta-badge--green { background: #e8f8ef; color: #16a34a; }
    .uta-badge--red { background: #fde8e8; color: #dc2626; }
    .uta-badge--blue { background: #eff6ff; color: #2563eb; }
    .uta-badge--orange { background: #fffbeb; color: #d97706; }

    .uta-code-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 6px;
      color: #475569;
      border: 1px solid #e2e8f0;
      font-weight: 600;
    }

    /* PrimeNG Table overrides */
    :host ::ng-deep {
      .p-datatable {
        .p-datatable-thead > tr > th {
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
          padding: 16px 20px;
        }

        .p-datatable-tbody > tr {
          background: #ffffff;
          transition: background 0.15s;

          &:hover {
            background: #f8fafc;
          }

          > td {
            padding: 14px 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9rem;
          }
        }
      }

      .p-paginator {
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
        padding: 12px;
        border-radius: 0 0 12px 12px;

        .p-paginator-page, .p-paginator-next, .p-paginator-last, .p-paginator-first, .p-paginator-prev {
          min-width: 32px;
          height: 32px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          margin: 0 2px;
          color: #64748b;

          &.p-highlight {
            background: #6B1A33;
            color: #fff;
          }
        }
      }
    }
  `]
})
export class MovimientosHistorialComponent implements OnInit, OnDestroy {
  protected Math = Math;
  private movimientoService = inject(MovimientoInventarioService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  movimientos: MovimientoInventario[] = [];
  loading = false;

  ngOnInit() {
    this.authService.sucursalActiva$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      if (id) {
        this.cargarMovimientos(id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarMovimientos(sucursalId: string) {
    this.loading = true;
    this.movimientoService.listarPorSucursal(sucursalId).subscribe({
      next: (res) => {
        this.movimientos = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getTotalMovimientos(): number {
    return this.movimientos.length;
  }

  getIngresosCount(): number {
    return this.movimientos.filter(m => m.tipo === 'INGRESO').length;
  }

  getVentasCount(): number {
    return this.movimientos.filter(m => m.tipo === 'VENTA').length;
  }

  getTrasladosCount(): number {
    return this.movimientos.filter(m => m.tipo === 'TRASLADO').length;
  }
}
