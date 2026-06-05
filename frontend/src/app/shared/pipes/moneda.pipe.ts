import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moneda',
  standalone: true
})
export class MonedaPipe implements PipeTransform {
  transform(value: number | null | undefined, mostrarSimbolo: boolean = true): string {
    if (value === null || value === undefined) return mostrarSimbolo ? '$0.00' : '0.00';
    
    if (!mostrarSimbolo) {
      return new Intl.NumberFormat('es-EC', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }

    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }
}