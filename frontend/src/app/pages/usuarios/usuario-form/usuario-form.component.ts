import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { Usuario, Rol } from '../../../core/models/usuario.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DropdownModule, InputTextModule, PasswordModule, CheckboxModule, InputNumberModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private sucursalService = inject(SucursalService);

  @Input() usuario: Usuario | null = null;
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: [''],
    nombreCompleto: ['', Validators.required],
    rolId: ['', Validators.required],
    sucursalId: [null],
    activo: [true]
  });

  roles: Rol[] = [];
  sucursales: Sucursal[] = [];
  loading = false;

  ngOnInit() {
    this.cargarRoles();
    this.cargarSucursales();

    if (this.usuario) {
      this.form.patchValue({
        username: this.usuario.username,
        nombreCompleto: this.usuario.nombreCompleto,
        rolId: this.usuario.rolId,
        sucursalId: this.usuario.sucursalId,
        activo: this.usuario.activo
      });
      // La contraseña no es requerida al editar
      this.form.get('password')?.setValidators(null);
    } else {
      // La contraseña es requerida al crear
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  cargarRoles() {
    this.usuarioService.obtenerRoles().subscribe(data => this.roles = data);
  }

  cargarSucursales() {
    this.sucursalService.obtenerTodas().subscribe(data => this.sucursales = data);
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.value;

    if (this.usuario) {
      this.usuarioService.actualizar(this.usuario.id, request).subscribe({
        next: () => {
          this.loading = false;
          this.guardado.emit();
        },
        error: () => this.loading = false
      });
    } else {
      this.usuarioService.crear(request).subscribe({
        next: () => {
          this.loading = false;
          this.guardado.emit();
        },
        error: () => this.loading = false
      });
    }
  }
}