import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  visible: boolean;
}

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogModule, UsuarioFormComponent],
  providers: [ConfirmationService],
  templateUrl: './usuarios-lista.component.html',
  styleUrl: './usuarios-lista.component.scss'
})
export class UsuariosListaComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);

  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  loading = false;

  displayForm = false;
  usuarioEditando: Usuario | null = null;

  // Search
  searchField = 'username';
  searchTerm = '';

  // Filter tabs
  estadoFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  // Toast
  toasts: ToastMessage[] = [];

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.obtenerTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getCountByRol(rol: string): number {
    return this.usuarios.filter(u => u.rolNombre === rol).length;
  }

  filtrarPorEstado(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.estadoFilter = estado;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.usuarios];

    // Status filter
    if (this.estadoFilter === 'ACTIVOS') {
      filtered = filtered.filter(u => u.activo);
    } else if (this.estadoFilter === 'INACTIVOS') {
      filtered = filtered.filter(u => !u.activo);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => {
        const value = (u as any)[this.searchField];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.filteredUsuarios = filtered;
  }

  nuevoUsuario() {
    this.usuarioEditando = null;
    this.displayForm = true;
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioEditando = usuario;
    this.displayForm = true;
  }

  eliminarUsuario(usuario: Usuario) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar al usuario <b>${usuario.username}</b>? Esta acción desactivará su acceso al sistema de forma permanente.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'SÍ, ELIMINAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.usuarioService.eliminar(usuario.id).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.showToast('success', 'Eliminado', 'Usuario eliminado correctamente');
          },
          error: (err) => {
            this.showToast('error', 'Error', 'No se pudo eliminar el usuario');
          }
        });
      }
    });
  }

  onGuardado() {
    this.displayForm = false;
    this.cargarUsuarios();
    this.showToast('success', 'Éxito', 'Usuario guardado correctamente');
  }

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