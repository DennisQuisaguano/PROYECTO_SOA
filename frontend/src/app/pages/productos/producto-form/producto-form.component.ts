import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { Producto, ProductoRequest } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { AuthService } from '../../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, DropdownModule, ButtonModule],
  templateUrl: './producto-form.component.html',
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .input-icon-wrapper {
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 0 12px;
      background: #fafafa;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-icon-wrapper:focus-within {
      border-color: #7B1F3A;
      box-shadow: 0 0 0 3px rgba(123, 31, 58, 0.1);
    }

    .input-icon {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-right: 8px;
      font-weight: 600;
      min-width: 18px;
      text-align: center;
    }

    .input-icon i {
      font-size: 0.85rem;
    }

    :host ::ng-deep .input-icon-wrapper .p-inputtext {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      padding: 10px 0;
    }

    :host ::ng-deep .input-icon-wrapper .p-inputnumber {
      width: 100%;
    }

    :host ::ng-deep .input-icon-wrapper .p-inputnumber-input {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      padding: 10px 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
      padding-top: 18px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-cancel {
      padding: 10px 24px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: #fff;
      color: #7B1F3A;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #fdf2f5;
      border-color: #7B1F3A;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: #7B1F3A;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #5A1428;
      box-shadow: 0 4px 12px rgba(123, 31, 58, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProductoFormComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Output() guardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sucursalService = inject(SucursalService);
  public authService = inject(AuthService);
  private messageService = inject(MessageService);

  categorias: Categoria[] = [];
  sucursales: Sucursal[] = [];
  loading = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    costoUnitario: [0.01, [Validators.required, Validators.min(0.01)]],
    precioVenta: [0.01, [Validators.required, Validators.min(0.01)]],
    categoriaId: ['', Validators.required],
    stockInicial: [0, [Validators.min(0)]],
    sucursalId: ['']
  });

  ngOnInit() {
    this.categoriaService.obtenerTodas().subscribe(data => this.categorias = data);
    this.sucursalService.obtenerTodas().subscribe(data => this.sucursales = data);

    const sucursalIdActiva = this.authService.getSucursalId();

    if (this.producto) {
      this.form.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        costoUnitario: this.producto.costoUnitario,
        precioVenta: this.producto.precioVenta,
        categoriaId: this.producto.categoriaId
      });
      this.form.get('stockInicial')?.disable();
      this.form.get('sucursalId')?.disable();
    } else if (sucursalIdActiva) {
      // Si es nuevo y hay sucursal activa (Bodeguero), preseleccionar
      this.form.get('sucursalId')?.setValue(sucursalIdActiva);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.getRawValue() as any;

    const obs = this.producto ?
      this.productoService.actualizar(this.producto.id, request) :
      this.productoService.crear(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Producto guardado correctamente' });
        this.guardado.emit();
      },
      error: () => this.loading = false
    });
  }
}