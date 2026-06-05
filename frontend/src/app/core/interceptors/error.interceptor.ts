import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error) => {
      let message = 'Ocurrió un error inesperado';

      if (error.status === 401) {
        authService.logout();
        message = 'Sesión expirada o no autorizada';
      } else if (error.status === 403) {
        message = 'No tiene permisos para realizar esta acción';
      } else if (error.status === 404) {
        message = 'Recurso no encontrado';
      } else if (error.status === 409 || error.status === 400) {
        message = error.error?.message || 'Error en la solicitud';
      } else if (error.status === 0) {
        message = 'No se pudo conectar con el servidor';
      }

      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
      });

      return throwError(() => error);
    })
  );
};