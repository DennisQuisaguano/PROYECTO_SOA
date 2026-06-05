import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente, ClienteRequest } from '../../../core/models/cliente.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [MessageService],
  templateUrl: './cliente-form.component.html',
  styles: []
})
export class ClienteFormComponent implements OnInit {
  @Input() cliente: Cliente | null = null;
  @Output() guardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  loading = false;

  form = this.fb.group({
    cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/), this.validarCedulaEc]],
    nombreUno: ['', [Validators.required, Validators.maxLength(50)]],
    nombreDos: ['', [Validators.maxLength(50)]],
    apellidoPaterno: ['', [Validators.required, Validators.maxLength(50)]],
    apellidoMaterno: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    direccion: ['']
  });

  ngOnInit() {
    if (this.cliente) {
      this.form.patchValue(this.cliente);
      this.form.get('cedula')?.disable();
    }
  }

  validarCedulaEc(control: AbstractControl): ValidationErrors | null {
    const cedula = control.value;
    if (!cedula || cedula.length !== 10) return null;

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return { cedulaInvalida: true };

    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    let suma = 0;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];

    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
      suma += (valor >= 10) ? valor - 9 : valor;
    }

    const decenaSuperior = (suma % 10 === 0) ? suma : (Math.floor(suma / 10) + 1) * 10;
    const digitoCalculado = decenaSuperior - suma;

    return digitoCalculado === digitoVerificador ? null : { cedulaInvalida: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.getRawValue() as ClienteRequest;

    const obs = this.cliente ?
      this.clienteService.actualizar(this.cliente.id, request) :
      this.clienteService.crear(request);

    obs.subscribe({
      next: () => {
        this.guardado.emit();
      },
      error: () => this.loading = false
    });
  }
}