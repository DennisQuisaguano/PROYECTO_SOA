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
  styleUrl: './producto-form.component.scss'
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