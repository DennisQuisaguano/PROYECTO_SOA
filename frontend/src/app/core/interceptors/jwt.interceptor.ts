import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const sucursalId = authService.getSucursalId();

  if (token && !req.url.includes('/auth/login')) {
    const headers: any = {
      Authorization: `Bearer ${token}`
    };
    if (sucursalId) {
      headers['X-Sucursal-Id'] = sucursalId;
    }
    const cloned = req.clone({
      setHeaders: headers
    });
    return next(cloned);
  }

  return next(req);
};