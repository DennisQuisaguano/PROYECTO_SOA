import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VentaService } from '../../../core/services/venta.service';
import { AuthService } from '../../../core/services/auth.service';
import { VentaResponse } from '../../../core/models/venta.model';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { FechaHoraPipe } from '../../../shared/pipes/fecha-hora.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, TableModule, ButtonModule,
    CalendarModule, TagModule, DialogModule, ConfirmDialogModule, TooltipModule,
    MonedaPipe, FechaHoraPipe
  ],
  templateUrl: './historial-ventas.component.html',
  styleUrl: './historial-ventas.component.scss'
})
export class HistorialVentasComponent implements OnInit, OnDestroy {
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private realtimeNotificationService = inject(RealtimeNotificationService);

  ventas: VentaResponse[] = [];
  ventasFiltradas: VentaResponse[] = [];
  loading = false;

  get sucursalNombre(): string {
    const id = this.authService.getSucursalId();
    if (this.ventas.length > 0 && id) {
      // Intentamos sacar el nombre de alguna venta o del servicio si estuviera disponible
      return this.ventas[0].sucursalNombre || 'MI NEGOCIO POS';
    }
    return 'MI NEGOCIO POS';
  }

  // Estadísticas KPI
  totalFacturado = 0;
  totalVentasContadas = 0;
  totalAnuladas = 0;
  totalIva = 0;

  searchTerm = '';
  searchCriterion = 'number';
  startDate = '';
  endDate = '';

  ventaSeleccionada: VentaResponse | null = null;
  detalleDialog = false;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.cargarVentas();

    const sucursalId = this.authService.getSucursalId();
    if (sucursalId) {
      this.realtimeNotificationService.onVentaEvent()
        .pipe(takeUntil(this.destroy$))
        .subscribe(evento => {
          if (evento.sucursalId === sucursalId) {
            if (evento.tipo === 'NUEVA_VENTA') {
              if (!this.ventas.some(v => v.id === evento.ventaId)) {
                setTimeout(() => {
                  this.ventaService.findById(evento.ventaId)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: (nuevaVenta) => {
                        this.ventas = [nuevaVenta, ...this.ventas];
                        this.aplicarFiltros();
                        this.recalcularKpis();
                        this.messageService.add({
                          severity: 'success',
                          summary: 'Nueva Venta',
                          detail: `Nueva venta registrada: ${evento.numFac}`
                        });
                      }
                    });
                }, 500);
              }
            } else if (evento.tipo === 'VENTA_ANULADA') {
              const venta = this.ventas.find(v => v.id === evento.ventaId);
              if (venta) {
                venta.estado = 'ANULADA';
                this.aplicarFiltros();
                this.recalcularKpis();
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Venta Anulada',
                  detail: `Factura ${evento.numFac} ha sido anulada`
                });
              } else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Venta Anulada',
                  detail: `La factura ${evento.numFac} de tu sucursal ha sido anulada`
                });
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarVentas() {
    const sucursalId = this.authService.getSucursalId();
    if (!sucursalId) return;

    this.loading = true;

    if (this.startDate && this.endDate) {
      this.ventaService.findByFechaBetween(this.startDate, this.endDate).subscribe({
        next: (data) => {
          this.ventas = data.filter(v => v.sucursalId === sucursalId);
          this.recalcularKpis();
          this.aplicarFiltros();
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.ventaService.findBySucursalId(sucursalId).subscribe({
        next: (page) => {
          this.ventas = page.content;
          this.recalcularKpis();
          this.aplicarFiltros();
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  recalcularKpis() {
    const ventasValidas = this.ventas.filter(v => v.estado !== 'ANULADA');
    this.totalFacturado = ventasValidas.reduce((acc, v) => acc + v.total, 0);
    this.totalIva = ventasValidas.reduce((acc, v) => acc + v.iva, 0);
    this.totalVentasContadas = ventasValidas.length;
    this.totalAnuladas = this.ventas.filter(v => v.estado === 'ANULADA').length;
  }

  aplicarFiltros() {
    if (!this.searchTerm) {
      this.ventasFiltradas = this.ventas;
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.ventasFiltradas = this.ventas.filter(v => {
      if (this.searchCriterion === 'number') {
        return v.numFac.toLowerCase().includes(term);
      } else if (this.searchCriterion === 'customer') {
        return v.clienteNombre.toLowerCase().includes(term);
      }
      return false;
    });
  }

  onSearchCriteriaChanged() {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  clearFilters() {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.cargarVentas();
  }

  verDetalle(venta: VentaResponse) {
    this.ventaSeleccionada = venta;
    this.detalleDialog = true;
  }

  descargarPdf(venta: VentaResponse) {
    this.ventaService.descargarFacturaPdf(venta.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${venta.numFac}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  anularVenta(venta: VentaResponse) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular la factura ${venta.numFac}? Esta acción repondrá el stock automáticamente.`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ventaService.anularVenta(venta.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Anulada', detail: 'Venta anulada correctamente' });
          this.cargarVentas();
        });
      }
    });
  }

  getClaveAcceso(venta: VentaResponse): string {
    if (!venta || !venta.numFac) return '';
    try {
      const d = new Date(venta.fecha);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      const dateStr = `${day}${month}${year}`;
      const cleanNum = venta.numFac.replace(/[^0-9]/g, '').slice(-9).padStart(9, '0');
      return `${dateStr}0199999999990012001001${cleanNum}123456781`;
    } catch (e) {
      return '010120260199999999990012001001000000001123456781';
    }
  }

  getStatusSeverity(estado: string): "success" | "info" | "warning" | "danger" | "secondary" {
    switch (estado) {
      case 'COMPLETADA': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'ANULADA': return 'danger';
      default: return 'secondary';
    }
  }
}