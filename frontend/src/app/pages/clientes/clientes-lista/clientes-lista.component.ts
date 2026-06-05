import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cliente } from '../../../core/models/cliente.model';
import { NombreCompletoPipe } from '../../../shared/pipes/nombre-completo.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DialogModule, NombreCompletoPipe, ClienteFormComponent],
  templateUrl: './clientes-lista.component.html',
  styles: [`
    :host {
      display: block;
      padding: 24px;
      background: #f5f0f2;
      min-height: 100vh;
    }

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
      min-width: 160px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .search-select:focus {
      border-color: #7B1F3A;
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

    .search-input:focus {
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

    .table-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px;
      color: #7B1F3A;
      font-size: 1rem;
    }

    .table-responsive { overflow-x: auto; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead tr { background: #faf5f7; }

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

    .table-row { transition: background 0.15s ease; }
    .table-row:hover { background: #fef8f9; }

    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .text-dark { color: #2d2d2d; }

    .cedula-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #f4e8ec;
      color: #7B1F3A;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: monospace;
    }

    .email-text, .phone-text {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 0.85rem;
    }

    .email-text i, .phone-text i {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .btn-action-edit {
      background: #f4e8ec;
      color: #7B1F3A;
    }

    .btn-action-edit:hover {
      background: #7B1F3A;
      color: #fff;
      transform: scale(1.1);
    }

    .empty-message {
      text-align: center;
      padding: 48px 20px !important;
      color: #aaa;
      font-size: 1rem;
    }

    .empty-message i {
      display: block;
      font-size: 2.5rem;
      margin-bottom: 12px;
      color: #ddd;
    }

    /* Toast */
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      min-width: 320px;
      transform: translateX(120%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid;
    }

    .toast-show { transform: translateX(0); }
    .toast-success { border-left-color: #22c55e; }
    .toast-error { border-left-color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }

    .toast-success .toast-icon { color: #22c55e; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: #3b82f6; }

    .toast-icon { font-size: 1.3rem; }
    .toast-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .toast-title { font-size: 0.88rem; color: #2d2d2d; }
    .toast-text { font-size: 0.82rem; color: #888; }

    .toast-close {
      background: none;
      border: none;
      color: #bbb;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
    }

    .toast-close:hover { color: #555; }

    /* Dialog overrides */
    :host ::ng-deep .premium-dialog .p-dialog-header {
      background: linear-gradient(135deg, #5A1428, #7B1F3A);
      color: #fff;
      border-radius: 14px 14px 0 0;
      padding: 18px 24px;
    }

    :host ::ng-deep .premium-dialog .p-dialog-header .p-dialog-title { color: #fff; font-weight: 700; }
    :host ::ng-deep .premium-dialog .p-dialog-header .p-dialog-header-icon { color: rgba(255,255,255,0.8); }
    :host ::ng-deep .premium-dialog .p-dialog-header .p-dialog-header-icon:hover { color: #fff; background: rgba(255,255,255,0.15); }
    :host ::ng-deep .premium-dialog .p-dialog-content { padding: 24px; border-radius: 0 0 14px 14px; }
    :host ::ng-deep .premium-dialog { border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }

    @media (max-width: 768px) {
      :host { padding: 16px; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .search-controls { flex-direction: column; }
      .search-select, .search-input { width: 100%; }
    }
  `]
})
export class ClientesListaComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);

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

  // Toast
  toasts: ToastMessage[] = [];

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.loading = true;
    this.clienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = [...this.clientes];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = [...this.clientes];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(c => {
      if (this.searchField === 'nombre') {
        const fullName = `${c.nombreUno} ${c.nombreDos || ''} ${c.apellidoPaterno} ${c.apellidoMaterno || ''}`.toLowerCase();
        return fullName.includes(term);
      }
      const value = (c as any)[this.searchField];
      return value && value.toString().toLowerCase().includes(term);
    });
  }

  nuevoCliente() {
    this.clienteEditando = null;
    this.displayForm = true;
  }

  editarCliente(cliente: Cliente) {
    this.clienteEditando = cliente;
    this.displayForm = true;
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