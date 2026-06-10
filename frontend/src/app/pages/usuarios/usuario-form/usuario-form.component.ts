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

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DropdownModule, InputTextModule, PasswordModule, CheckboxModule, InputNumberModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private sucursalService = inject(SucursalService);
  private confirmationService = inject(ConfirmationService);

  @Input() usuario: Usuario | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: [''],
    nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    rolId: ['', Validators.required],
    sucursalId: [null],
    activo: [true],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]]
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
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        rolId: this.usuario.rolId,
        sucursalId: this.usuario.sucursalId,
        activo: this.usuario.activo,
        telefono: this.usuario.telefono
      });
      
      // Limpiar validadores para edición (hacerlo opcional)
      const passwordControl = this.form.get('password');
      passwordControl?.clearValidators();
      
      // Solo si el usuario escribe algo, validar longitud mínima
      passwordControl?.valueChanges.subscribe(value => {
        if (value && value.length > 0) {
          passwordControl.setValidators([Validators.minLength(6)]);
        } else {
          passwordControl.clearValidators();
        }
        passwordControl.updateValueAndValidity({ emitEvent: false });
      });

    } else {
      // Al crear, la contraseña es obligatoria y con longitud mínima
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.get('password')?.updateValueAndValidity();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
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

  onCancelar() {
    if (this.form.dirty) {
      this.confirmationService.confirm({
        message: 'Hay cambios sin guardar. ¿Está seguro que desea salir?',
        header: 'Confirmar Cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'SÍ, SALIR',
        rejectLabel: 'CONTINUAR EDITANDO',
        acceptButtonStyleClass: 'p-button-danger p-button-text',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        accept: () => {
          this.cancelado.emit();
        }
      });
    } else {
      this.cancelado.emit();
    }
  }
}