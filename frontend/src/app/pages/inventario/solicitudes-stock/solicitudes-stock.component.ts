import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudStockService } from '../../../core/services/solicitud-stock.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Inventario } from '../../../core/models/inventario.model';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FechaHoraPipe } from '../../../shared/pipes/fecha-hora.pipe';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
  selector: 'app-solicitudes-stock',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, ButtonModule,
    TooltipModule, ToastModule, DialogModule, ConfirmDialogModule, InputNumberModule,
    DropdownModule, ProgressSpinnerModule, FechaHoraPipe
  ],
  templateUrl: './solicitudes-stock.component.html',
  styleUrl: './solicitudes-stock.component.scss'
})
export class SolicitudesStockComponent implements OnInit, OnDestroy {
  private solicitudService = inject(SolicitudStockService);
  private inventarioService = inject(InventarioService);
  private sucursalService = inject(SucursalService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  solicitudes: any[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  nuevasSolicitudesIds: Set<string> = new Set();

  // ─── Modal Aprobación ───────────────────────────────────────────────────────
  guardandoAprobacion = false;

  // ─── Modal Nueva Solicitud ──────────────────────────────────────────────────
  displayNuevaSolicitud = false;
  cargandoNuevaSolicitud = false;
  guardandoNuevaSolicitud = false;

  sucursalesDisponibles: Sucursal[] = [];
  sucursalOrigenSeleccionada: Sucursal | null = null;

  productosEnOrigen: Inventario[] = [];
  cargandoProductos = false;
  productoSeleccionado: Inventario | null = null;
  cantidadSolicitar: number = 1;

  get miSucursalId(): string | null {
    return this.authService.getSucursalId();
  }

  ngOnInit() {
    this.cargarSolicitudes();
    this.cargarSucursales();

    this.realtimeNotificationService.onSolicitudEvent()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evento => {
        const userSucursalId = this.authService.getSucursalId();
        const userRol = this.authService.getRol();

        if (evento.tipo === 'NUEVA_SOLICITUD' && userRol === 'BODEGUERO' && evento.sucursalOrigenId === userSucursalId) {
          const nuevaSol = {
            id: evento.solicitudId,
            fechaCreacion: evento.timestamp,
            productoNombre: evento.productoNombre,
            sucursalOrigenId: evento.sucursalOrigenId,
            sucursalOrigenNombre: 'Mi Sucursal (Origen)',
            sucursalDestinoId: evento.sucursalSolicitanteId,
            sucursalDestinoNombre: 'Sucursal Solicitante',
            cantidad: evento.cantidadSolicitada,
            estado: evento.estado
          };
          this.solicitudes = [nuevaSol, ...this.solicitudes];
          this.nuevasSolicitudesIds.add(evento.solicitudId);
          setTimeout(() => this.nuevasSolicitudesIds.delete(evento.solicitudId), 5000);
          this.messageService.add({
            severity: 'info',
            summary: 'Nueva Solicitud',
            detail: `Nueva solicitud de stock para ${evento.productoNombre}`
          });
        } else if (evento.tipo === 'SOLICITUD_APROBADA' && userRol === 'CAJERO' && evento.sucursalSolicitanteId === userSucursalId) {
          this.actualizarEstadoSolicitud(evento.solicitudId, 'APROBADA');
          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud Aprobada',
            detail: `Tu solicitud de ${evento.productoNombre} fue aprobada. ${evento.cantidadAprobada} unidades en camino`
          });
        } else if (evento.tipo === 'SOLICITUD_RECHAZADA' && userRol === 'CAJERO' && evento.sucursalSolicitanteId === userSucursalId) {
          this.actualizarEstadoSolicitud(evento.solicitudId, 'RECHAZADA');
          this.messageService.add({
            severity: 'error',
            summary: 'Solicitud Rechazada',
            detail: `Tu solicitud de ${evento.productoNombre} fue rechazada`
          });
        } else if ((evento.tipo === 'SOLICITUD_APROBADA' || evento.tipo === 'SOLICITUD_RECHAZADA') &&
          (evento.sucursalOrigenId === userSucursalId || this.authService.isAdmin())) {
          const nuevoEstado = evento.tipo === 'SOLICITUD_APROBADA' ? 'APROBADA' : 'RECHAZADA';
          this.actualizarEstadoSolicitud(evento.solicitudId, nuevoEstado);
        }
      });
  }

  private actualizarEstadoSolicitud(id: string, estado: string) {
    const idx = this.solicitudes.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.solicitudes[idx].estado = estado;
    }
  }

  cargarSolicitudes() {
    this.loading = true;
    this.notificationService.solicitudes$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.solicitudes = data;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    this.notificationService.refresh();
  }

  private cargarSucursales() {
    this.sucursalService.obtenerTodas().subscribe({
      next: (sucursales) => {
        // Excluir la sucursal propia del usuario
        this.sucursalesDisponibles = sucursales.filter(s => s.id !== this.miSucursalId);
      }
    });
  }

  // ─── Nueva Solicitud ────────────────────────────────────────────────────────

  abrirNuevaSolicitud() {
    this.sucursalOrigenSeleccionada = null;
    this.productoSeleccionado = null;
    this.productosEnOrigen = [];
    this.cantidadSolicitar = 1;
    this.displayNuevaSolicitud = true;
  }

  onSucursalOrigenChange(sucursal: Sucursal) {
    if (!sucursal) {
      this.productosEnOrigen = [];
      this.productoSeleccionado = null;
      return;
    }
    this.cargandoProductos = true;
    this.productoSeleccionado = null;
    // Carga los productos disponibles (stock > 0) en la sucursal de origen seleccionada
    this.inventarioService.findDisponiblesBySucursalId(sucursal.id).subscribe({
      next: (items) => {
        this.productosEnOrigen = items;
        this.cargandoProductos = false;
        if (items.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin stock disponible',
            detail: `La sucursal "${sucursal.nombre}" no tiene productos con stock disponible.`
          });
        }
      },
      error: () => {
        this.cargandoProductos = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el inventario de la sucursal seleccionada.'
        });
      }
    });
  }

  confirmarNuevaSolicitud() {
    if (!this.sucursalOrigenSeleccionada || !this.productoSeleccionado || this.cantidadSolicitar <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Debe seleccionar sucursal de origen, producto y cantidad.'
      });
      return;
    }

    if (this.cantidadSolicitar > this.productoSeleccionado.stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock insuficiente',
        detail: `Solo hay ${this.productoSeleccionado.stock} unidades disponibles en esa sucursal.`
      });
      return;
    }

    this.guardandoNuevaSolicitud = true;

    const origenId = this.sucursalOrigenSeleccionada.id;  // Sucursal que tiene el stock
    const destinoId = this.miSucursalId!;                 // Mi sucursal (quien solicita)
    const productoId = this.productoSeleccionado.productoId;
    const cantidad = this.cantidadSolicitar;

    this.solicitudService.crear(origenId, destinoId, productoId, cantidad).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Solicitud Enviada!',
          detail: `Se solicitó ${cantidad} unidades de "${this.productoSeleccionado!.productoNombre}" a ${this.sucursalOrigenSeleccionada!.nombre}.`
        });
        this.displayNuevaSolicitud = false;
        this.guardandoNuevaSolicitud = false;
        this.notificationService.refresh();
      },
      error: (err) => {
        this.guardandoNuevaSolicitud = false;
        const msg = err?.error?.message || 'Error al crear la solicitud.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  // ─── Gestión (Bodeguero) ────────────────────────────────────────────────────

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  puedeGestionar(sol: any): boolean {
    return this.authService.isBodeguero() && sol.sucursalOrigenId === this.authService.getSucursalId();
  }

  puedeSolicitar(): boolean {
    return this.authService.isCajero() || this.authService.isAdmin();
  }

  aprobar(sol: any) {
    this.confirmationService.confirm({
      key: 'solicitudActionDialog',
      message: `¿Está seguro que desea aprobar el despacho de <b>${sol.cantidad}</b> unidades de <b>"${sol.productoNombre}"</b>?`,
      header: 'Confirmar Aprobación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'SÍ, APROBAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-success p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.guardandoAprobacion = true;
        this.solicitudService.aprobar(sol.id, sol.cantidad).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Traslado aprobado correctamente' });
            this.guardandoAprobacion = false;
            this.notificationService.refresh();
          },
          error: () => { this.guardandoAprobacion = false; }
        });
      }
    });
  }

  rechazar(id: string) {
    this.confirmationService.confirm({
      key: 'solicitudActionDialog',
      message: '¿Está seguro que desea rechazar esta solicitud de traslado? Esta acción no se puede deshacer.',
      header: 'Confirmar Rechazo',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'SÍ, RECHAZAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.solicitudService.rechazar(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'warn', summary: 'Rechazada', detail: 'Solicitud rechazada' });
            this.notificationService.refresh();
          }
        });
      }
    });
  }

  getSeverity(estado: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (estado) {
      case 'APROBADA': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'RECHAZADA': return 'danger';
      default: return 'secondary';
    }
  }

  isNueva(id: string): boolean {
    return this.nuevasSolicitudesIds.has(id);
  }

  getStockLabel(item: Inventario): string {
    return `${item.productoNombre} — Stock: ${item.stock} uds.`;
  }
}
