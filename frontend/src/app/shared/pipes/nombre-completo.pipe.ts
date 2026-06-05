import { Pipe, PipeTransform } from '@angular/core';
import { Cliente } from '../../core/models/cliente.model';

@Pipe({
  name: 'nombreCompleto',
  standalone: true
})
export class NombreCompletoPipe implements PipeTransform {
  transform(cliente: Cliente | null | undefined): string {
    if (!cliente) return '';
    
    const partes = [
      cliente.nombreUno,
      cliente.nombreDos,
      cliente.apellidoPaterno,
      cliente.apellidoMaterno
    ].filter(p => !!p);

    return partes.map(p => this.capitalize(p!)).join(' ');
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}