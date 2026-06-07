import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';
import { RealtimeNotificationService } from '../../../core/services/realtime-notification.service';
import { Cliente } from '../../../core/models/cliente.model';
import { NombreCompletoPipe } from '../../../shared/pipes/nombre-completo.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  visible: boolean;
}

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogModule, NombreCompletoPipe, ClienteFormComponent],
  providers: [ConfirmationService],
  templateUrl: './clientes-lista.component.html',
  styleUrl: './clientes-lista.component.scss'
})
export class ClientesListaComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private realtimeService = inject(RealtimeNotificationService);
  private confirmationService = inject(ConfirmationService);

  /** Solo el ADMIN puede crear y editar clientes */
  isAdmin = this.authService.isAdmin();

  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  loading = false;

  displayForm = false;
  clienteEditando: Cliente | null = null;

  // Search
  searchField = 'cedula';
  searchTerm = '';

  // Tab filter matching screenshot
  estadoFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  // Toast
  toasts: ToastMessage[] = [];

  ngOnInit() {
    this.cargarClientes();
    this.suscribirEventos();
  }

  cargarClientes() {
    this.loading = true;
    this.clienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  suscribirEventos() {
    this.realtimeService.onClienteEvent().subscribe(() => {
      this.cargarClientes();
    });
  }

  applyFilter() {
    let filtered = [...this.clientes];

    // Filter by active state tab
    if (this.estadoFilter === 'ACTIVOS') {
      // All customers are treated as active since they don't have an active flag
      filtered = [...this.clientes];
    } else if (this.estadoFilter === 'INACTIVOS') {
      filtered = [];
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        if (this.searchField === 'nombre') {
          const fullName = `${c.nombreUno} ${c.nombreDos || ''} ${c.apellidoPaterno} ${c.apellidoMaterno || ''}`.toLowerCase();
          return fullName.includes(term);
        }
        const value = (c as any)[this.searchField];
        return value && value.toString().toLowerCase().includes(term);
      });
    }

    this.filteredClientes = filtered;
  }

  filtrarPorEstado(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.estadoFilter = estado;
    this.applyFilter();
  }

  nuevoCliente() {
    this.clienteEditando = null;
    this.displayForm = true;
  }

  editarCliente(cliente: Cliente) {
    this.clienteEditando = cliente;
    this.displayForm = true;
  }

  eliminarCliente(cliente: Cliente) {
    this.confirmationService.confirm({
      key: 'clienteActionDialog',
      message: `¿Está seguro que desea eliminar al cliente <b>${cliente.nombreUno} ${cliente.apellidoPaterno}</b>? Esta acción desactivará su perfil de forma permanente.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'SÍ, ELIMINAR',
      rejectLabel: 'CANCELAR',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.clienteService.eliminar(cliente.id).subscribe({
          next: () => {
            // cargarClientes se llamará vía WebSocket automáticamente, 
            // pero lo llamamos aquí también por si el WS falla o es lento localmente
            this.cargarClientes();
            this.showToast('success', 'Eliminado', 'Cliente eliminado correctamente');
          },
          error: (err) => {
            this.showToast('error', 'Error', 'No se pudo eliminar el cliente');
          }
        });
      }
    });
  }

  onGuardado() {
    this.displayForm = false;
    this.cargarClientes();
    this.showToast('success', 'Éxito', 'Cliente guardado correctamente');
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