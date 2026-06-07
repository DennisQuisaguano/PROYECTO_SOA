import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';
import { MessageService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputSwitchModule, InputNumberModule],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent implements OnInit {
  @Input() categoria: Categoria | null = null;
  @Output() guardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);

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
}
