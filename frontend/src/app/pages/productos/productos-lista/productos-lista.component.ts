import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { Inventario } from '../../../core/models/inventario.model';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProductoFormComponent } from '../producto-form/producto-form.component';

interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  visible: boolean;
}

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogModule, MonedaPipe, ProductoFormComponent],
  providers: [ConfirmationService],
  templateUrl: './productos-lista.component.html',
  styleUrl: './productos-lista.component.scss'
})
export class ProductosListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private inventarioService = inject(InventarioService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  
  productos: Inventario[] = [];
  filteredProductos: Inventario[] = [];
  loading = false;
  
  displayForm = false;
  productoEditando: Producto | null = null;

  // Search
  searchField = 'productoNombre';
  searchTerm = '';

  // Tab filter
  estadoFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  // Toast
  toasts: ToastMessage[] = [];

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    const sucursalId = this.authService.getSucursalId();
    if (!sucursalId) return;

    this.loading = true;
    this.inventarioService.findBySucursalId(sucursalId).subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    let filtered = [...this.productos];

    if (this.estadoFilter === 'ACTIVOS') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.estadoFilter === 'INACTIVOS') {
      filtered = filtered.filter(p => !p.activo);
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

  filtrarPorEstado(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.estadoFilter = estado;
    this.applyFilter();
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

  eliminarProducto(inventario: Inventario) {
    this.confirmationService.confirm({
      key: 'productoActionDialog',
      message: `¿Está seguro que desea eliminar el producto <b>${inventario.productoNombre}</b>? Esta acción desactivará el ítem en el catálogo global.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'SÍ, ELIMINAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.productoService.eliminar(inventario.productoId).subscribe({
          next: () => {
            this.cargarProductos();
            this.showToast('success', 'Eliminado', 'Producto eliminado correctamente');
          },
          error: (err) => {
            this.showToast('error', 'Error', 'No se pudo eliminar el producto');
          }
        });
      }
    });
  }

  onGuardado() {
    this.displayForm = false;
    this.cargarProductos();
    this.showToast('success', 'Éxito', 'Producto guardado correctamente');
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