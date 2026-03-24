/**
 * @file auth.interceptor.ts
 * @description Global HTTP middleware for security token injection and error handling
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
/**
 * @summary Security interceptor function
 * Injects Authorization headers into outgoing requests and traps 401 errors for session expiry handling
 */
// #region authInterceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');
    // Inject token if present in local storage
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }
    return next(req).pipe(
        catchError((error) => {
            // Redirect to login on authentication failure, excluding the auth endpoints itself
            const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
            if (error.status === 401 && !isAuthEndpoint) {
                localStorage.removeItem('token');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
// #endregion
