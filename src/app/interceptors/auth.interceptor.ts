import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token
  const token = authService.getToken();

  // Clonar la petición y agregar el header de autorización si existe token
  // Preservar los headers existentes
  if (token) {
    const headers = req.headers.set('Authorization', `Bearer ${token}`);
    req = req.clone({ headers });
  }

  // Ejecutar la petición y manejar errores
  return next(req).pipe(
    catchError(error => {
      // Log detallado para diagnóstico
      if (error.status === 0 || !error.status) {
        console.error('🔴 Error de conexión en interceptor:', {
          url: req.url,
          method: req.method,
          hasToken: !!token,
          error: error.message || error
        });
      }
      
      // Si la petición retorna 401 (no autorizado), cerrar sesión
      if (error.status === 401) {
        console.warn('⚠️ Error 401 - No autorizado, cerrando sesión');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};


