/**
 * @file auth.interceptor.ts
 * @description Global HTTP middleware for security token injection and 401 redirect handling
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../feature/login/service/auth-service';

/**
 * @summary Security interceptor function
 * Injects Authorization headers into outgoing requests and handles 401 redirects.
 */

// #region authInterceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = inject(AuthService).getToken();
    // Inject token if present via AuthService (single source of truth)
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }
    return next(req).pipe(
        catchError((error) => {
            // Redirect to login on authentication failure, excluding the auth endpoints itself
            const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/me');
            if (error.status === 401 && !isAuthEndpoint) {
                inject(AuthService).logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
// #endregion
