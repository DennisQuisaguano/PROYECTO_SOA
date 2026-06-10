import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';
import { MessageService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputSwitchModule, InputNumberModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent implements OnInit {
  @Input() categoria: Categoria | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    activo: [true]
  });

  ngOnInit() {
    if (this.categoria) {
      this.form.patchValue({
        nombre: this.categoria.nombre,
        descripcion: this.categoria.descripcion,
        activo: this.categoria.activo
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.value as any;

    const obs = this.categoria ?
      this.categoriaService.actualizar(this.categoria.id, request) :
      this.categoriaService.crear(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría guardada' });
        this.guardado.emit();
      },
      error: () => this.loading = false
    });
  }

  onCancelar() {
    if (this.form.dirty) {
      this.confirmationService.confirm({
        message: 'Hay cambios sin guardar en la categoría. ¿Está seguro que desea salir?',
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
