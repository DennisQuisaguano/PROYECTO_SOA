import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventarioService } from '../../../core/services/inventario.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { Inventario } from '../../../core/models/inventario.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, map } from 'rxjs';
import { ProductoFormComponent } from '../../productos/producto-form/producto-form.component';
import { SolicitudStockService } from '../../../core/services/solicitud-stock.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
    TagModule, DialogModule, DropdownModule, SelectButtonModule,
    InputNumberModule, InputTextareaModule, InputTextModule, AutoCompleteModule,
    MonedaPipe, ProductoFormComponent, ProgressSpinnerModule, ToastModule
  ],
  templateUrl: './inventario-lista.component.html',
  styles: [`
    :host {
      display: block;
      padding: 24px;
      background: #f5f0f2;
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
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.4rem;
      box-shadow: 0 4px 15px rgba(90, 20, 40, 0.3);
    }

    .page-title {
      font-size: 1.65rem;
      font-weight: 700;
      color: #2d2d2d;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.88rem;
      color: #888;
      margin: 4px 0 0 0;
    }

    .btn-primary-gradient {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 24px;
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(90, 20, 40, 0.3);
      transition: all 0.25s ease;
    }

    .btn-primary-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(90, 20, 40, 0.45);
    }

    /* ==================== SEARCH SECTION ==================== */
    .search-card {
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      margin-bottom: 24px;
    }

    .search-card-header {
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      color: #fff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .search-card-body {
      padding: 20px 24px;
    }

    .search-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-select {
      padding: 10px 16px;
      border: 2px solid #e9e0e3;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #5A1428;
      background: #fbf8f9;
      min-width: 140px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .search-input {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid #e9e0e3;
      border-radius: 10px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
      background: #fbf8f9;
    }

    .search-input:focus, .search-select:focus {
      border-color: #7B1F3A;
    }

    .btn-search {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .btn-search:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(90, 20, 40, 0.35);
    }

    /* ==================== TABLE SECTION ==================== */
    .table-card {
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .table-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid #f1e8eb;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.05rem;
      font-weight: 700;
      color: #5A1428;
      margin: 0;
    }

    .count-badge {
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      color: #fff;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead tr {
      background: #faf5f7;
    }

    .data-table th {
      padding: 14px 20px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #7B1F3A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e9e0e3;
      white-space: nowrap;
    }

    .data-table td {
      padding: 14px 20px;
      font-size: 0.9rem;
      color: #555;
      border-bottom: 1px solid #f1eaec;
    }

    .table-row:hover {
      background: #fef8f9;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-optimo {
      background: #e8f8ef;
      color: #1e8a4a;
    }

    .status-critico {
      background: #fde8e8;
      color: #c53030;
    }

    .btn-action-premium {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    .btn-ingreso {
      background: #e8f8ef;
      color: #1e8a4a;
    }

    .btn-ingreso:hover {
      background: #1e8a4a;
      color: #fff;
      transform: scale(1.05);
    }

    .btn-baja {
      background: #fde8e8;
      color: #c53030;
    }

    .btn-baja:hover {
      background: #c53030;
      color: #fff;
      transform: scale(1.05);
    }

    .btn-traslado {
      background: #e8f0fe;
      color: #1a56db;
    }

    .btn-traslado:hover {
      background: #1a56db;
      color: #fff;
      transform: scale(1.05);
    }

    .empty-message {
      text-align: center;
      padding: 64px 20px !important;
      color: #aaa;
    }

    .empty-message i {
      font-size: 3rem;
      margin-bottom: 16px;
      display: block;
      color: #ddd;
    }

    /* AutoComplete Styling to match Admin Inputs */
    ::ng-deep .search-autocomplete .p-autocomplete-input {
      width: 100% !important;
      padding: 10px 16px !important;
      border: 2px solid #e9e0e3 !important;
      border-radius: 10px !important;
      font-size: 0.9rem !important;
      background: #fbf8f9 !important;
      outline: none !important;
      transition: border-color 0.2s !important;
    }

    ::ng-deep .search-autocomplete .p-autocomplete-input:focus {
      border-color: #7B1F3A !important;
    }
  `]
})
export class InventarioListaComponent implements OnInit, OnDestroy {
  private inventarioService = inject(InventarioService);
  private sucursalService = inject(SucursalService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  authService = inject(AuthService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private solicitudStockService = inject(SolicitudStockService);

  // Datos
  productosGlobales: Producto[] = [];
  inventarioSucursal: Inventario[] = [];
  sucursales: Sucursal[] = [];
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  
  // UI State
  categoriasFiltradas: Categoria[] = [];
  sucursalSeleccionada: string = '';
  loading = false;
  mostrarTabla = false;
  
  // Filtros
  filtroTexto: string = '';
  tipoBusqueda: 'productoNombre' | 'productoId' = 'productoNombre';
  categoriaSeleccionada: string | null = null;
  categoriaInput: any;

  tiposBusqueda = [
    { label: 'Nombre', value: 'productoNombre' },
    { label: 'Código', value: 'productoId' }
  ];

  updatedProductIds: Set<string> = new Set();
  private destroy$ = new Subject<void>();

  // Modales ajuste
  displayAjuste = false;
  displayNuevoProducto = false;

  ajusteForm = this.fb.group({
    tipo: ['ingreso', Validators.required],
    productoId: ['', Validators.required],
    productoNombre: [''],
    sucursalId: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.minLength(5)]]
  });
  guardandoAjuste = false;

  // ── Solicitud de Traslado ──────────────────────────────────────────────────
  /** Sucursales distintas a la activa (para cargar disponibilidad global) */
  sucursalesDisponibles: Sucursal[] = [];
  /** Mapa productoId → [{sucursal, stock}] de OTRAS sucursales */
  productosEnOtrasSucursales: Map<string, { sucursal: Sucursal; stock: number }[]> = new Map();

  displaySolicitudTraslado = false;
  productoParaSolicitar: any = null;
  /** Sucursales que tienen stock del producto seleccionado */
  sucursalesConProducto: { label: string; sucursal: Sucursal; stock: number }[] = [];
  entradaOrigenSeleccionada: { label: string; sucursal: Sucursal; stock: number } | null = null;
  maxStockOrigen = 0;
  cantidadSolicitar = 1;
  guardandoSolicitud = false;

  get nombreSucursalActiva(): string {
    if (!this.sucursales || this.sucursales.length === 0) return 'Cargando...';
    const sucursal = this.sucursales.find(s => s.id === this.sucursalSeleccionada);
    return sucursal ? sucursal.nombre : this.sucursalSeleccionada;
  }

  get inventarioFiltrado(): any[] {
    if (!this.mostrarTabla || !this.categoriaSeleccionada) return [];

    // Ahora filtramos directamente sobre lo que la sucursal TIENE registrado
    // Esto evita que productos de otras sucursales aparezcan con 0
    return this.inventarioSucursal
      .filter(inv => {
        // Encontrar la info del producto en el catálogo global
        const p = this.productosGlobales.find(prod => prod.id === inv.productoId);
        if (!p) return false;

        // Filtro 1: Categoría seleccionada
        const matchesCat = p.categoriaId === this.categoriaSeleccionada;
        if (!matchesCat) return false;

        // Filtro 2: Texto de búsqueda (opcional)
        if (!this.filtroTexto) return true;
        const q = this.filtroTexto.toLowerCase();
        return this.tipoBusqueda === 'productoNombre' 
          ? p.nombre.toLowerCase().includes(q) 
          : p.id.toLowerCase().includes(q);
      })
      .map(inv => {
        const p = this.productosGlobales.find(prod => prod.id === inv.productoId)!;
        return {
          productoId: p.id,
          productoNombre: p.nombre,
          precioVenta: p.precioVenta,
          stock: inv.stock,
          sucursalId: this.sucursalSeleccionada,
          categoriaNombre: p.categoriaNombre
        };
      });
  }

  ngOnInit() {
    this.loading = true;
    forkJoin({
      sucursales: this.sucursalService.obtenerTodas(),
      categorias: this.categoriaService.obtenerTodas(),
      productos: this.productoService.findAll(0, 1000)
    }).subscribe(res => {
      this.sucursales = res.sucursales;
      this.categorias = res.categorias;
      this.productosGlobales = res.productos.content;
      this.productos = res.productos.content;

      this.authService.sucursalActiva$.pipe(takeUntil(this.destroy$)).subscribe(id => {
        if (id) {
          this.sucursalSeleccionada = id;
          this.sucursalesDisponibles = this.sucursales.filter(s => s.id !== id);
          this.cargarInventarioReal();
          this.cargarDisponibilidadGlobal();
        }
      });
      this.loading = false;
    });

    this.realtimeNotificationService.onStockUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evento => {
        const item = this.inventarioSucursal.find(i => i.productoId === evento.productoId);
        if (item) {
          item.stock = evento.stockActual;
          this.updatedProductIds.add(evento.productoId);
          setTimeout(() => this.updatedProductIds.delete(evento.productoId), 1000);
        } else if (evento.sucursalId === this.sucursalSeleccionada) {
          this.cargarInventarioReal();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarInventarioReal() {
    this.inventarioService.findBySucursalId(this.sucursalSeleccionada).subscribe(data => {
      this.inventarioSucursal = data;
    });
  }

  filtrarCategorias(event: any) {
    const query = event.query.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(c => c.nombre.toLowerCase().includes(query));
  }

  seleccionarCategoria(event: any) {
    if (event && event.id) {
      this.categoriaSeleccionada = event.id;
    }
  }

  onClearCategoria() {
    this.categoriaSeleccionada = null;
    this.categoriaInput = null;
    this.mostrarTabla = false;
  }

  buscar() {
    // 1. Determinar el nuevo ID basado en el input actual (siempre validamos de nuevo)
    let nuevoId = null;

    if (this.categoriaInput) {
      if (typeof this.categoriaInput === 'object' && this.categoriaInput.id) {
        nuevoId = this.categoriaInput.id;
      } else {
        const texto = this.categoriaInput.toString().toLowerCase().trim();
        const cat = this.categorias.find(c => c.nombre.toLowerCase().trim() === texto);
        if (cat) {
          nuevoId = cat.id;
        }
      }
    }

    // 2. Aplicar el cambio
    if (nuevoId) {
      this.categoriaSeleccionada = nuevoId; // Esto dispara la actualización del getter inventarioFiltrado
      this.mostrarTabla = true;
      
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Catálogo Actualizado', 
        detail: `Mostrando productos de la nueva categoría` 
      });
    } else {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Búsqueda Fallida', 
        detail: 'Por favor seleccione una categoría válida de las sugerencias' 
      });
    }
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.categoriaSeleccionada = null;
    this.categoriaInput = null;
    this.mostrarTabla = false;
  }

  abrirIngreso(item: any) {
    this.ajusteForm.reset({
      tipo: 'ingreso',
      productoId: item.productoId,
      productoNombre: item.productoNombre,
      sucursalId: this.sucursalSeleccionada,
      cantidad: 1,
      motivo: 'Ingreso manual de mercadería'
    });
    this.ajusteForm.get('motivo')?.clearValidators();
    this.ajusteForm.get('motivo')?.updateValueAndValidity();
    this.displayAjuste = true;
  }

  abrirBaja(item: any) {
    this.ajusteForm.reset({
      tipo: 'baja',
      productoId: item.productoId,
      productoNombre: item.productoNombre,
      sucursalId: this.sucursalSeleccionada,
      cantidad: 1,
      motivo: ''
    });
    this.ajusteForm.get('motivo')?.setValidators([Validators.required, Validators.minLength(5)]);
    this.ajusteForm.get('motivo')?.updateValueAndValidity();
    this.displayAjuste = true;
  }

  guardarAjuste() {
    if (this.ajusteForm.invalid) return;
    this.guardandoAjuste = true;
    const val = this.ajusteForm.value;
    const cantidadFinal = val.tipo === 'baja' ? -val.cantidad! : val.cantidad!;

    this.inventarioService.ajustarStock({
      sucursalId: val.sucursalId!,
      productoId: val.productoId!,
      cantidad: cantidadFinal,
      motivo: val.motivo || 'Ingreso de mercadería'
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Operación realizada' });
        this.displayAjuste = false;
        this.guardandoAjuste = false;
        this.cargarInventarioReal();
      },
      error: () => this.guardandoAjuste = false
    });
  }

  irAProductos() {
    this.displayNuevoProducto = true;
  }

  onProductoGuardado() {
    this.displayNuevoProducto = false;
    this.productoService.findAll(0, 1000).subscribe(res => {
      this.productosGlobales = res.content;
      this.cargarInventarioReal();
    });
  }

  getAlertaSeverity(stock: number): 'success' | 'danger' | 'secondary' {
    return stock >= 10 ? 'success' : 'danger';
  }

  /** Llamar cuando el admin cambia de sucursal en el dropdown */
  onSucursalChange() {
    this.sucursalesDisponibles = this.sucursales.filter(s => s.id !== this.sucursalSeleccionada);
    this.cargarInventarioReal();
    this.cargarDisponibilidadGlobal();
  }

  // ── Disponibilidad global ──────────────────────────────────────────────────

  /** Carga el inventario disponible (stock > 0) de TODAS las otras sucursales
   *  y construye el mapa productoId → [{sucursal, stock}] */
  private cargarDisponibilidadGlobal() {
    if (this.sucursalesDisponibles.length === 0) return;
    const requests = this.sucursalesDisponibles.map(suc =>
      this.inventarioService.findDisponiblesBySucursalId(suc.id).pipe(
        map(items => ({ sucursal: suc, items }))
      )
    );
    forkJoin(requests).subscribe(results => {
      this.productosEnOtrasSucursales.clear();
      results.forEach(({ sucursal, items }) => {
        items.forEach(inv => {
          if (!this.productosEnOtrasSucursales.has(inv.productoId)) {
            this.productosEnOtrasSucursales.set(inv.productoId, []);
          }
          this.productosEnOtrasSucursales.get(inv.productoId)!.push({ sucursal, stock: inv.stock });
        });
      });
    });
  }

  /** Devuelve true si el producto tiene stock disponible en AL MENOS una otra sucursal */
  tieneStockEnOtrasSucursales(productoId: string): boolean {
    const entries = this.productosEnOtrasSucursales.get(productoId);
    return !!entries && entries.length > 0;
  }

  /** El usuario puede solicitar traslados (CAJERO o ADMIN) */
  puedeSolicitar(): boolean {
    return this.authService.isCajero() || this.authService.isAdmin();
  }

  // ── Dialog Solicitud de Traslado (desde la tabla) ─────────────────────────

  abrirSolicitudTraslado(item: any) {
    this.productoParaSolicitar = item;
    this.entradaOrigenSeleccionada = null;
    this.maxStockOrigen = 0;
    this.cantidadSolicitar = 1;
    // Construir opciones: una entrada por sucursal que tenga stock
    const entradas = this.productosEnOtrasSucursales.get(item.productoId) ?? [];
    this.sucursalesConProducto = entradas.map(e => ({
      label: `${e.sucursal.nombre}  (${e.stock} disponibles)`,
      sucursal: e.sucursal,
      stock: e.stock
    }));
    this.displaySolicitudTraslado = true;
  }

  onOrigenSolicitudChange(entrada: { label: string; sucursal: Sucursal; stock: number } | null) {
    this.entradaOrigenSeleccionada = entrada;
    this.maxStockOrigen = entrada?.stock ?? 0;
    this.cantidadSolicitar = 1;
  }

  confirmarSolicitudTraslado() {
    if (!this.entradaOrigenSeleccionada || this.cantidadSolicitar <= 0) return;
    if (this.cantidadSolicitar > this.maxStockOrigen) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock insuficiente',
        detail: `Solo hay ${this.maxStockOrigen} unidades disponibles en esa sucursal.`
      });
      return;
    }
    this.guardandoSolicitud = true;
    this.solicitudStockService.crear(
      this.entradaOrigenSeleccionada.sucursal.id,
      this.sucursalSeleccionada,
      this.productoParaSolicitar.productoId,
      this.cantidadSolicitar
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Solicitud enviada!',
          detail: `${this.cantidadSolicitar} uds de "${this.productoParaSolicitar.productoNombre}" solicitadas a ${this.entradaOrigenSeleccionada!.sucursal.nombre}.`
        });
        this.displaySolicitudTraslado = false;
        this.guardandoSolicitud = false;
      },
      error: (err) => {
        this.guardandoSolicitud = false;
        const msg = err?.error?.message || 'Error al enviar la solicitud.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}
