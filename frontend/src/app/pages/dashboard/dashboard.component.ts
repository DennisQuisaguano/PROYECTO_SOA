import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { InventarioService } from '../../core/services/inventario.service';
import { AuthService } from '../../core/services/auth.service';
import { VentaResponse } from '../../core/models/venta.model';
import { MonedaPipe } from '../../shared/pipes/moneda.pipe';
import { interval, Subject, takeUntil } from 'rxjs';

import { RealtimeNotificationService } from '../../core/services/realtime-notification.service';
import { BodegaDashboardComponent } from './bodega-dashboard/bodega-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, TagModule, MonedaPipe, BodegaDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private inventarioService = inject(InventarioService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  public authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  metrics = {
    ventasHoy: 0,
    recaudadoHoy: 0,
    stockBajo: 0,
    totalClientes: 0
  };

  currentDate: string = '';

  ngOnInit() {
    this.currentDate = new Date().toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.loadData();
    
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadData());

    const sucursalId = this.authService.getSucursalId();
    if (sucursalId) {
      // Ventas - Solo si no es bodeguero
      if (!this.authService.isBodeguero()) {
        this.realtimeNotificationService.onVentaEvent()
          .pipe(takeUntil(this.destroy$))
          .subscribe(evento => {
            if (evento.sucursalId === sucursalId) {
              if (evento.tipo === 'NUEVA_VENTA') {
                this.metrics.ventasHoy++;
                this.metrics.recaudadoHoy += evento.total;
              } else if (evento.tipo === 'VENTA_ANULADA') {
                this.metrics.ventasHoy = Math.max(0, this.metrics.ventasHoy - 1);
                this.metrics.recaudadoHoy = Math.max(0, this.metrics.recaudadoHoy - evento.total);
              }
            }
          });
      }

      // Stock - Todos los roles autorizados para ver inventario
      this.realtimeNotificationService.onStockUpdate()
        .pipe(takeUntil(this.destroy$))
        .subscribe(evento => {
          if (evento.sucursalId === sucursalId) {
            const antesBajo = evento.stockAnterior < 10;
            const ahoraBajo = evento.stockActual < 10;
            if (!antesBajo && ahoraBajo) {
              this.metrics.stockBajo++;
            } else if (antesBajo && !ahoraBajo) {
              this.metrics.stockBajo = Math.max(0, this.metrics.stockBajo - 1);
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    const today = new Date().toISOString().split('T')[0];
    const sucursalId = this.authService.getSucursalId();

    // Solo cargar métricas de ventas y clientes si el rol lo permite
    if (!this.authService.isBodeguero()) {
      this.ventaService.findByFechaBetween(today, today).subscribe({
        next: (ventas) => {
          const completadas = ventas.filter(v => v.estado === 'COMPLETADA');
          this.metrics.ventasHoy = completadas.length;
          this.metrics.recaudadoHoy = completadas.reduce((acc, v) => acc + v.total, 0);
        },
        error: () => {} // Evitar log de error 403 en consola
      });

      this.clienteService.obtenerTodos().subscribe({
        next: (clientes) => {
          this.metrics.totalClientes = clientes.length;
        },
        error: () => {}
      });
    }

    if (sucursalId) {
      this.inventarioService.findBySucursalId(sucursalId).subscribe(inv => {
        this.metrics.stockBajo = inv.filter(i => i.stock < 10).length;
      });
    }
  }
}