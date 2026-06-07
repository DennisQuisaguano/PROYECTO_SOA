import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { SolicitudStockService } from '../../../core/services/solicitud-stock.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { Inventario } from '../../../core/models/inventario.model';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductoFormComponent } from '../../productos/producto-form/producto-form.component';
import { Subject, takeUntil, forkJoin, map, catchError, of } from 'rxjs';

interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  visible: boolean;
}

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, ConfirmDialogModule, DropdownModule, InputNumberModule,
    MonedaPipe, ProductoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './inventario-lista.component.html',
  styleUrl: './inventario-lista.component.scss'
})
export class InventarioListaComponent implements OnInit, OnDestroy {
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private sucursalService = inject(SucursalService);
  private categoriaService = inject(CategoriaService);
  private solicitudStockService = inject(SolicitudStockService);
  public authService = inject(AuthService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  
  productos: Inventario[] = [];
  filteredProductos: Inventario[] = [];
  loading = false;
  
  displayForm = false;
  productoEditando: Producto | null = null;

  // Filtros Sucursal Local
  searchField = 'productoNombre';
  searchTerm = '';
  estadoFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';
  categoriaFiltro: string | null = null;
  categorias: Categoria[] = [];

  // Stock Replenishment Modal (Bodeguero)
  displayAjuste = false;
  ajusteProducto: Inventario | null = null;
  ajusteCantidad = 1;
  ajusteReferencia = '';
  guardandoAjuste = false;

  // Explorador Externo (Cajero/Admin)
  externalInventory: any[] = [];
  filteredExternal: any[] = [];
  loadingExternal = false;
  searchExternalTerm = '';
  searchExternalField = 'productoNombre';

  // Toast
  toasts: ToastMessage[] = [];
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
    this.cargarInventarioExterno();
    this.suscribirActualizaciones();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCategorias() {
    this.categoriaService.obtenerTodas().subscribe(data => this.categorias = data);
  }

  cargarProductos() {
    const sucursalId = this.authService.getSucursalId();
    if (!sucursalId) return;

    this.loading = true;
    this.inventarioService.findBySucursalId(sucursalId).subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilter();
        // Cuando carguen los locales, aplicamos el filtro al inventario externo
        this.applyExternalFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cargarInventarioExterno() {
    const sucursalId = this.authService.getSucursalId();
    if (!sucursalId) return;

    this.loadingExternal = true;
    this.sucursalService.obtenerTodas().subscribe(sucursales => {
      const otras = sucursales.filter(s => s.id !== sucursalId);
      
      if (otras.length === 0) {
        this.externalInventory = [];
        this.filteredExternal = [];
        this.loadingExternal = false;
        return;
      }

      const requests = otras.map(s => 
        this.inventarioService.findDisponiblesBySucursalId(s.id).pipe(
          map(items => items.map(i => ({ ...i, sucursalNombre: s.nombre }))),
          catchError(() => of([]))
        )
      );

      forkJoin(requests).subscribe({
        next: (results) => {
          this.externalInventory = results.flat();
          this.applyExternalFilter();
          this.loadingExternal = false;
        },
        error: () => this.loadingExternal = false
      });
    });
  }

  suscribirActualizaciones() {
    this.realtimeNotificationService.onStockUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evento => {
        if (evento.sucursalId === this.authService.getSucursalId()) {
          const item = this.productos.find(p => p.productoId === evento.productoId);
          if (item) {
            item.stock = evento.stockActual;
            this.applyFilter();
            this.applyExternalFilter();
          } else {
            this.cargarProductos();
          }
        } else {
          this.cargarInventarioExterno();
        }
      });
  }

  applyFilter() {
    let filtered = [...this.productos];

    if (this.estadoFilter === 'ACTIVOS') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.estadoFilter === 'INACTIVOS') {
      filtered = filtered.filter(p => !p.activo);
    }

    if (this.categoriaFiltro) {
      filtered = filtered.filter(p => p.categoriaId === this.categoriaFiltro);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const value = (p as any)[this.searchField];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.filteredProductos = filtered;
  }

  applyExternalFilter() {
    // Definimos "no tener" como que el producto NO exista en el inventario local
    const localProductIds = new Set(this.productos.map(p => p.productoId));

    let filtered = this.externalInventory.filter(i => !localProductIds.has(i.productoId));

    if (this.searchExternalTerm.trim()) {
      const term = this.searchExternalTerm.toLowerCase();
      filtered = filtered.filter(i => {
        const value = (i as any)[this.searchExternalField];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.filteredExternal = filtered;
  }

  filtrarPorEstado(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.estadoFilter = estado;
    this.applyFilter();
  }

  abrirReabastecer(inv: Inventario) {
    this.ajusteProducto = inv;
    this.ajusteCantidad = 1;
    this.ajusteReferencia = '';
    this.displayAjuste = true;
  }

  confirmarReabastecer() {
    if (!this.ajusteProducto || this.ajusteCantidad <= 0) return;
    this.guardandoAjuste = true;

    this.inventarioService.ajustarStock({
      sucursalId: this.ajusteProducto.sucursalId,
      productoId: this.ajusteProducto.productoId,
      cantidad: this.ajusteCantidad,
      motivo: this.ajusteReferencia || 'Reabastecimiento de inventario'
    }).subscribe({
      next: () => {
        this.showToast('success', 'Reabastecido', 'Stock incrementado correctamente');
        this.displayAjuste = false;
        this.guardandoAjuste = false;
        this.cargarProductos();
      },
      error: () => {
        this.showToast('error', 'Error', 'No se pudo reabastecer el stock');
        this.guardandoAjuste = false;
      }
    });
  }

  abrirSolicitud(item: any) {
    this.confirmationService.confirm({
      key: 'inventarioActionDialog',
      header: 'Confirmar Solicitud de Traslado',
      message: `¿Desea solicitar unidades de <b>"${item.productoNombre}"</b> a la sucursal <b>${item.sucursalNombre}</b>?`,
      icon: 'pi pi-truck',
      acceptLabel: 'ENVIAR SOLICITUD',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-primary p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.enviarSolicitud(item);
      }
    });
  }

  private enviarSolicitud(item: any) {
    this.solicitudStockService.crear(
      item.sucursalId,
      this.authService.getSucursalId()!,
      item.productoId,
      1 // Por defecto 1, el bodeguero puede ajustar al aprobar si es necesario o podemos añadir un prompt
    ).subscribe({
      next: () => {
        this.showToast('success', 'Solicitud Enviada', 'La solicitud ha sido enviada correctamente');
        this.cargarInventarioExterno();
      },
      error: (err) => {
        this.showToast('error', 'Error', err?.error?.message || 'No se pudo enviar la solicitud');
      }
    });
  }

  nuevoProducto() {
    this.productoEditando = null;
    this.displayForm = true;
  }

  editarProducto(inventario: Inventario) {
    this.productoEditando = {
      id: inventario.productoId,
      nombre: inventario.productoNombre,
      descripcion: inventario.descripcion,
      costoUnitario: inventario.costoUnitario,
      precioVenta: inventario.precioVenta,
      activo: inventario.activo,
      categoriaId: inventario.categoriaId,
      categoriaNombre: inventario.categoriaNombre
    };
    this.displayForm = true;
  }

  onGuardado() {
    this.displayForm = false;
    this.cargarProductos();
    this.showToast('success', 'Éxito', 'Producto actualizado correctamente');
  }

  // Toast helpers
  showToast(type: ToastMessage['type'], title: string, message: string) {
    const toast: ToastMessage = { type, title, message, visible: false };
    this.toasts.push(toast);
    setTimeout(() => toast.visible = true, 50);
    setTimeout(() => this.removeToast(this.toasts.indexOf(toast)), 4000);
  }

  removeToast(index: number) {
    if (index >= 0 && index < this.toasts.length) {
      this.toasts[index].visible = false;
      setTimeout(() => this.toasts.splice(index, 1), 350);
    }
  }
}
