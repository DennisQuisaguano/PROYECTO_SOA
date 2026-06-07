import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { VentaService } from '../../../core/services/venta.service';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitudStockService } from '../../../core/services/solicitud-stock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ConfigService } from '../../../core/services/config.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Inventario } from '../../../core/models/inventario.model';
import { VentaRequest } from '../../../core/models/venta.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Categoria } from '../../../core/models/categoria.model';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject, takeUntil, forkJoin, map, catchError, of } from 'rxjs';

interface ItemVenta {
  inventario: Inventario;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MonedaPipe,
    CardModule, InputTextModule, ButtonModule, AutoCompleteModule, 
    TableModule, InputNumberModule, DialogModule, ToastModule, TooltipModule, TagModule,
    DropdownModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './nueva-venta.component.html',
  styleUrl: './nueva-venta.component.scss'
})
export class NuevaVentaComponent implements OnInit, OnDestroy {
  private clienteService = inject(ClienteService);
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  public authService = inject(AuthService);
  private solicitudStockService = inject(SolicitudStockService);
  private notificationService = inject(NotificationService);
  private realtimeNotificationService = inject(RealtimeNotificationService);
  private sucursalService = inject(SucursalService);
  private categoriaService = inject(CategoriaService);
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  cedulaBusqueda = '';
  clienteSeleccionado: Cliente | null = null;
  buscandoCliente = false;

  sugerenciasClientes: Cliente[] = [];
  sugerenciasInventario: Inventario[] = [];
  itemSeleccionado: Inventario | null = null;
  cantidadSeleccionada = 1;
  inventarioLocal: Inventario[] = [];

  productosEnVenta: ItemVenta[] = [];
  procesandoVenta = false;
  ventaExitosaDialog = false;
  ultimaVentaId = '';
  ultimaVentaNumFac = '';

  displayGlobalStock = false;
  stockGlobal: Inventario[] = [];
  
  displayClienteDialog = false;
  displayProductoDialog = false;
  listaClientes: Cliente[] = [];

  customerSearchTerm = '';
  customerSearchCriterion = 'card';
  clientesFiltrados: Cliente[] = [];

  productSearchTerm = '';
  productSearchCriterion = 'name';
  productosFiltrados: Inventario[] = [];
  
  cantidadFaltanteCalculada = 0;
  displayCantidadDialog = false;
  itemParaTraslado: any = null;
  cantidadTraslado = 1;

  // ─── Explorador Externo ──────────────────────────────────────────
  displayBusquedaSucursalDialog = false;
  loadingRemoto = false;
  inventarioRemotoTotal: any[] = [];
  inventarioRemotoFiltrado: any[] = [];
  termBusquedaRemota = '';
  searchFieldRemoto = 'productoNombre';
  categoriaFiltroRemoto: string | null = null;

  sucursales: Sucursal[] = [];
  categorias: Categoria[] = [];
  
  productosEnOtrasSucursales: Map<string, { sucursal: Sucursal; stock: number }[]> = new Map();

  subtotalVenta = 0;
  ivaVenta = 0;
  totalVenta = 0;
  ivaPromedioEtiqueta = '15%'; // Etiqueta dinámica para el resumen

  productosGlobales: any[] = [];

  get sucursalNombre(): string {
    const id = this.authService.getSucursalId();
    if (this.sucursales.length > 0 && id) {
      const s = this.sucursales.find(suc => suc.id === id);
      return s ? s.nombre : 'MI NEGOCIO POS';
    }
    return 'MI NEGOCIO POS';
  }

  ivaGlobalCache: number | null = null;

  ngOnInit() {
    this.cargarDatosIniciales();
    this.authService.sucursalActiva$.pipe(takeUntil(this.destroy$)).subscribe(sucursalId => {
      if (sucursalId) {
        this.nuevaVenta();
        this.cargarInventarioLocal();
        this.cargarDisponibilidadGlobal();
      }
    });

    // Eliminamos la suscripción a notificationService.solicitudes$ que causaba recargas cada 3 segundos.
    // El stock ya se actualiza mediante WebSockets (onStockUpdate).

    this.realtimeNotificationService.onStockUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evento => {
        const sucursalActualId = this.authService.getSucursalId();
        if (evento.sucursalId !== sucursalActualId) {
          this.cargarDisponibilidadGlobal();
        }
        const item = this.productosEnVenta.find(p => p.inventario.productoId === evento.productoId);
        if (item) {
          item.inventario.stock = evento.stockActual;
        }
        const loc = this.inventarioLocal.find(i => i.productoId === evento.productoId);
        if (loc) {
          loc.stock = evento.stockActual;
          this.filtrarProductos();
        }
      });
  }

  ngOnDestroy(): void {
    this.ventaService.setVentaEnCurso(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatosIniciales() {
    forkJoin({
      sucursales: this.sucursalService.obtenerTodas(),
      categorias: this.categoriaService.obtenerTodas(),
      productos: this.productoService.findAll(0, 1000)
    }).subscribe(res => {
      this.sucursales = res.sucursales;
      this.categorias = res.categorias;
      this.productosGlobales = res.productos.content;
      this.cargarInventarioLocal();
      this.cargarDisponibilidadGlobal();
    });
  }

  cargarInventarioLocal() {
    const sucursalId = this.authService.getSucursalId();
    if (sucursalId) {
      this.inventarioService.findBySucursalId(sucursalId).subscribe(data => {
        this.inventarioLocal = data;
        this.filtrarProductos();
      });
    }
  }

  cargarDisponibilidadGlobal() {
    const sucursalActualId = this.authService.getSucursalId();
    if (!sucursalActualId || this.sucursales.length === 0) return;
    const sucursalesOtras = this.sucursales.filter(s => s.id !== sucursalActualId);
    const requests = sucursalesOtras.map(suc =>
      this.inventarioService.findDisponiblesBySucursalId(suc.id).pipe(
        map(items => ({ sucursal: suc, items })),
        catchError(() => of({ sucursal: suc, items: [] }))
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
      // Sincronizar el inventario remoto total para el explorador
      this.cargarInventarioRemotoGlobal();
    });
  }

  tieneStockEnOtrasSucursales(productoId: string): boolean {
    const entries = this.productosEnOtrasSucursales.get(productoId);
    return !!entries && entries.length > 0;
  }

  abrirBusquedaSucursal() {
    this.displayBusquedaSucursalDialog = true;
    this.cargarInventarioRemotoGlobal();
  }

  cargarInventarioRemotoGlobal() {
    const sucursalActualId = this.authService.getSucursalId();
    if (!sucursalActualId) return;

    this.loadingRemoto = true;
    const sucursalesOtras = this.sucursales.filter(s => s.id !== sucursalActualId);
    
    const requests = sucursalesOtras.map(suc =>
      this.inventarioService.findDisponiblesBySucursalId(suc.id).pipe(
        map(items => items.map(i => ({ ...i, sucursalNombre: suc.nombre }))),
        catchError(() => of([]))
      )
    );

    forkJoin(requests).subscribe(results => {
      this.inventarioRemotoTotal = results.flat();
      this.filtrarInventarioRemoto();
      this.loadingRemoto = false;
    });
  }

  filtrarInventarioRemoto() {
    // REQUERIMIENTO: Solo productos que NO existan en la sucursal actual
    const idsLocales = new Set(this.inventarioLocal.map(i => i.productoId));
    let filtered = this.inventarioRemotoTotal.filter(i => !idsLocales.has(i.productoId));

    if (this.categoriaFiltroRemoto) {
      filtered = filtered.filter(i => i.categoriaId === this.categoriaFiltroRemoto);
    }

    if (this.termBusquedaRemota.trim()) {
      const term = this.termBusquedaRemota.toLowerCase().trim();
      filtered = filtered.filter(i => {
        const value = (i as any)[this.searchFieldRemoto];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.inventarioRemotoFiltrado = filtered;
  }

  filtrarClientes() {
    if (!this.customerSearchTerm) {
      this.clientesFiltrados = this.listaClientes;
      return;
    }
    const term = this.customerSearchTerm.toLowerCase().trim();
    this.clientesFiltrados = this.listaClientes.filter(c => {
      if (this.customerSearchCriterion === 'card') return c.cedula.toLowerCase().includes(term);
      if (this.customerSearchCriterion === 'name') return `${c.apellidoPaterno} ${c.nombreUno}`.toLowerCase().includes(term);
      return false;
    });
  }

  filtrarProductos() {
    if (!this.productosGlobales) return;

    const term = this.productSearchTerm.toLowerCase().trim();
    
    this.productosFiltrados = this.productosGlobales
      .filter(p => p.nombre.toLowerCase().includes(term) || p.id.toLowerCase().includes(term))
      .map(p => {
        const inv = this.inventarioLocal.find(i => i.productoId === p.id);
        return {
          productoId: p.id,
          productoNombre: p.nombre,
          precioVenta: p.precioVenta,
          stock: inv ? inv.stock : 0,
          sucursalId: this.authService.getSucursalId()!,
          sucursalNombre: this.sucursalNombre,
          categoriaId: p.categoriaId,
          categoriaNombre: p.categoriaNombre
        } as Inventario;
      });
  }

  seleccionarCliente(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.displayClienteDialog = false;
  }

  deseleccionarCliente() {
    this.clienteSeleccionado = null;
  }

  abrirClienteDialog() {
    this.clienteService.obtenerTodos().subscribe(data => {
      this.listaClientes = data;
      this.filtrarClientes();
      this.displayClienteDialog = true;
    });
  }

  abrirProductoDialog() {
    this.filtrarProductos();
    this.displayProductoDialog = true;
  }

  consultarEnOtrasSucursales() {
    const item = this.itemSeleccionado;
    const sucursalActualId = this.authService.getSucursalId();
    if (item && item.productoId && sucursalActualId) {
      this.inventarioService.findByProductoId(item.productoId, sucursalActualId).subscribe(data => {
        this.stockGlobal = data;
        if (this.stockGlobal.length === 0 || this.stockGlobal.every(s => s.stock === 0)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Sin Stock Global',
            detail: `El producto "${item.productoNombre}" no tiene existencias en ninguna otra sucursal.`
          });
          this.displayGlobalStock = false;
        } else {
          this.displayGlobalStock = true;
        }
      });
    }
  }

  traerProducto(item: any) {
    this.confirmationService.confirm({
      key: 'posActionDialog',
      header: 'Confirmar Solicitud de Traslado',
      message: `¿Está seguro que desea solicitar unidades de <b>"${item.productoNombre}"</b> a la sucursal <b>${item.sucursalNombre}</b>?`,
      icon: 'pi pi-truck',
      acceptLabel: 'SÍ, SOLICITAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-primary p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        if (this.itemSeleccionado?.stock === 0 || !this.itemSeleccionado) {
          this.itemParaTraslado = item;
          this.cantidadTraslado = 1;
          this.displayCantidadDialog = true;
        } else {
          this.itemParaTraslado = item;
          this.cantidadTraslado = this.cantidadFaltanteCalculada || 1;
          this.confirmarTraslado();
        }
      }
    });
  }

  confirmarTraslado() {
    if (!this.itemParaTraslado || this.cantidadTraslado <= 0) return;
    
    if (this.cantidadTraslado > this.itemParaTraslado.stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Excede Disponibilidad',
        detail: `La sucursal de origen solo cuenta con ${this.itemParaTraslado.stock} unidades.`
      });
      return;
    }

    const destinoId = this.authService.getSucursalId()!;
    this.solicitudStockService.crear(this.itemParaTraslado.sucursalId, destinoId, this.itemParaTraslado.productoId, this.cantidadTraslado).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Solicitud Enviada', detail: `Se ha solicitado el stock correctamente.` });
        this.displayCantidadDialog = false;
        this.displayGlobalStock = false;
        this.displayBusquedaSucursalDialog = false;
      }
    });
  }

  agregarProducto() {
    if (!this.itemSeleccionado) return;
    
    if (this.itemSeleccionado.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Stock Local',
        detail: 'Este producto no tiene stock en esta sucursal. Consulte disponibilidad en otras sedes.'
      });
      this.cantidadFaltanteCalculada = 1;
      this.consultarEnOtrasSucursales();
      return;
    }

    const itemExistente = this.productosEnVenta.find(p => p.inventario.productoId === this.itemSeleccionado!.productoId);
    if (itemExistente) {
      if (itemExistente.cantidad + 1 > this.itemSeleccionado.stock) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Límite alcanzado',
          detail: 'No hay más unidades disponibles localmente.'
        });
        this.cantidadFaltanteCalculada = 1;
        this.consultarEnOtrasSucursales();
        return;
      }
      itemExistente.cantidad += 1;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.inventario.precioVenta;
    } else {
      this.productosEnVenta.push({
        inventario: { ...this.itemSeleccionado },
        cantidad: 1,
        subtotal: this.itemSeleccionado.precioVenta
      });
    }
    this.recalcularTotales();
    this.ventaService.setVentaEnCurso(true);
  }

  quitarProducto(productoId: string) {
    this.productosEnVenta = this.productosEnVenta.filter(p => p.inventario.productoId !== productoId);
    this.recalcularTotales();
    this.ventaService.setVentaEnCurso(this.productosEnVenta.length > 0);
  }

  actualizarCantidad(item: ItemVenta, nuevaCantidad: number) {
    if (nuevaCantidad > item.inventario.stock) {
      const stockDisp = item.inventario.stock;
      const faltante = nuevaCantidad - stockDisp;
      this.cantidadFaltanteCalculada = faltante;
      this.itemSeleccionado = item.inventario;
      
      this.inventarioService.findByProductoId(item.inventario.productoId, this.authService.getSucursalId()!).subscribe(data => {
        const tieneGlobal = data.some(s => s.stock > 0);
        if (tieneGlobal) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stock Insuficiente',
            detail: `Solo hay ${stockDisp} unidades locales. Faltan ${faltante} para completar el pedido. Mostrando opciones de traslado...`
          });
          this.stockGlobal = data;
          this.displayGlobalStock = true;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Sin Stock Suficiente',
            detail: `Solo hay ${stockDisp} unidades y no existe stock en ninguna otra sucursal.`
          });
        }
      });
      
      item.cantidad = stockDisp > 0 ? stockDisp : 1;
    } else {
      item.cantidad = nuevaCantidad < 1 ? 1 : nuevaCantidad;
    }
    item.subtotal = item.cantidad * item.inventario.precioVenta;
    this.recalcularTotales();
  }

  recalcularTotales() {
    this.subtotalVenta = 0;
    this.ivaVenta = 0;
    
    if (this.ivaGlobalCache !== null) {
      this.aplicarTotales(this.ivaGlobalCache);
    } else {
      this.configService.getConfig().subscribe(config => {
        this.ivaGlobalCache = config.ivaPorcentaje || 15;
        this.aplicarTotales(this.ivaGlobalCache!);
      });
    }
  }

  private aplicarTotales(porcentajeIva: number) {
    this.ivaPromedioEtiqueta = porcentajeIva + '%';
    this.subtotalVenta = 0;
    this.ivaVenta = 0;

    this.productosEnVenta.forEach(item => {
      this.subtotalVenta += item.subtotal;
      this.ivaVenta += item.subtotal * (porcentajeIva / 100);
    });

    this.totalVenta = this.subtotalVenta + this.ivaVenta;
  }

  finalizarVenta() {
    if (!this.clienteSeleccionado || this.productosEnVenta.length === 0) return;
    this.procesandoVenta = true;
    const request: VentaRequest = {
      clienteId: this.clienteSeleccionado.id,
      sucursalId: this.authService.getSucursalId()!,
      cajeroId: this.authService.getUserId()!,
      detalles: this.productosEnVenta.map(p => ({ productoId: p.inventario.productoId, cantidad: p.cantidad }))
    };
    this.ventaService.crearVenta(request).subscribe({
      next: (res) => {
        this.ultimaVentaNumFac = res.numFac;
        this.ultimaVentaId = res.id;
        this.ventaExitosaDialog = true;
        this.procesandoVenta = false;
      },
      error: () => this.procesandoVenta = false
    });
  }

  nuevaVenta() {
    this.productosEnVenta = [];
    this.clienteSeleccionado = null;
    this.recalcularTotales();
    this.ventaExitosaDialog = false;
    this.ventaService.setVentaEnCurso(false);
  }

  descargarPdf() {
    this.ventaService.descargarFacturaPdf(this.ultimaVentaId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${this.ultimaVentaNumFac}.pdf`;
      a.click();
    });
  }

  hasStockError(): boolean {
    return this.productosEnVenta.some(item => item.cantidad > item.inventario.stock || item.inventario.stock === 0);
  }
}
