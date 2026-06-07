import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Categoria } from '../../../core/models/categoria.model';
import { Producto } from '../../../core/models/producto.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoriaFormComponent } from '../categoria-form/categoria-form.component';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { ConfigService } from '../../../core/services/config.service';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-categorias-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    CategoriaFormComponent,
    MonedaPipe,
    InputNumberModule
  ],
  providers: [ConfirmationService],
  templateUrl: './categorias-lista.component.html',
  styleUrl: './categorias-lista.component.scss'
})
export class CategoriasListaComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);
  private configService = inject(ConfigService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  productosDeCategoria: any[] = [];
  loading = false;
  mostrarDialog = false;
  mostrarProductosDialog = false;
  mostrarIvaDialog = false;
  categoriaSeleccionada: Categoria | null = null;
  ivaGlobal: number = 15;

  // Search and tabs state
  searchTerm = '';
  searchField = 'nombre';
  estadoFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.loading = true;
    this.categoriaService.obtenerTodas(false).subscribe({
      next: (data) => {
        this.categorias = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  abrirIvaDialog() {
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.ivaGlobal = config.ivaPorcentaje;
        this.mostrarIvaDialog = true;
      }
    });
  }

  guardarIva() {
    this.loading = true;
    this.configService.updateIva(this.ivaGlobal).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'IVA global actualizado correctamente' });
        this.mostrarIvaDialog = false;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // KPI Getters
  get totalCategorias(): number {
    return this.categorias.length;
  }

  get categoriasActivas(): number {
    return this.categorias.filter(c => c.activo).length;
  }

  get categoriasInactivas(): number {
    return this.categorias.filter(c => !c.activo).length;
  }

  get categoriasConDescripcion(): number {
    return this.categorias.filter(c => c.descripcion && c.descripcion.trim().length > 0).length;
  }

  filtrarPorEstado(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.estadoFilter = estado;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.categorias];

    // Status filter
    if (this.estadoFilter === 'ACTIVOS') {
      filtered = filtered.filter(c => c.activo);
    } else if (this.estadoFilter === 'INACTIVOS') {
      filtered = filtered.filter(c => !c.activo);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const value = (c as any)[this.searchField];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.filteredCategorias = filtered;
  }

  nuevaCategoria() {
    this.categoriaSeleccionada = null;
    this.mostrarDialog = true;
  }

  editarCategoria(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.mostrarDialog = true;
  }

  verProductos(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.loading = true;
    this.productoService.obtenerPorCategoria(categoria.id).subscribe({
      next: (data) => {
        this.productosDeCategoria = data;
        this.mostrarProductosDialog = true;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  eliminarCategoria(categoria: Categoria) {
    this.confirmationService.confirm({
      key: 'eliminarCategoriaDialog',
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar la categoría "${categoria.nombre}"? Esta acción ocultará la categoría del catálogo de productos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'SÍ, ELIMINAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => {
        this.loading = true;
        this.categoriaService.eliminar(categoria.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'Categoría eliminada exitosamente' });
            this.cargarCategorias();
          },
          error: () => this.loading = false
        });
      }
    });
  }

  onGuardado() {
    this.mostrarDialog = false;
    this.cargarCategorias();
  }
}
