import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoInventarioService, MovimientoInventario } from '../../../core/services/movimiento-inventario.service';
import { AuthService } from '../../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FechaHoraPipe } from '../../../shared/pipes/fecha-hora.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movimientos-historial',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, FechaHoraPipe],
  template: `
    <div class="card p-4">
        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="text-2xl font-bold m-0 text-900">Historial de Movimientos de Bodega (Kardex)</h2>
        </div>

        <p-table [value]="movimientos" [loading]="loading" [paginator]="true" [rows]="15" 
                 styleClass="p-datatable-striped" [responsive]="true">
            <ng-template pTemplate="header">
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Producto</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-center">Cantidad</th>
                    <th>Motivo / Justificación</th>
                    <th class="text-center">Responsable</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-mov>
                <tr>
                    <td>{{mov.fecha | fechaHora}}</td>
                    <td class="font-bold">{{mov.productoNombre}}</td>
                    <td class="text-center">
                        <p-tag [value]="mov.tipo" [severity]="getTipoSeverity(mov.tipo)" 
                               [style]="{'width': '95px', 'display': 'inline-flex', 'justify-content': 'center', 'font-weight': '700'}"></p-tag>
                    </td>
                    <td class="text-center">
                        <span class="text-lg font-bold text-900">
                            {{ Math.abs(mov.cantidad) }}
                        </span>
                    </td>
                    <td>
                        <span class="text-700">{{mov.motivo}}</span>
                    </td>
                    <td class="text-center">
                        <span class="p-1 px-2 bg-gray-100 border-round text-sm font-medium">{{ '@' }}{{mov.username}}</span>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="6" class="text-center p-5 text-600">No se han registrado movimientos en esta sucursal</td>
                </tr>
            </ng-template>
        </p-table>
    </div>
  `
})
export class MovimientosHistorialComponent implements OnInit {
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

  getTipoSeverity(tipo: string): 'success' | 'danger' | 'info' | 'warning' | 'secondary' {
    switch(tipo) {
      case 'INGRESO': return 'success'; // Verde
      case 'BAJA': return 'danger';    // Rojo
      case 'TRASLADO': return 'danger'; // Rojo (según solicitado)
      case 'VENTA': return 'warning';   // Naranja
      default: return 'secondary';
    }
  }
}
