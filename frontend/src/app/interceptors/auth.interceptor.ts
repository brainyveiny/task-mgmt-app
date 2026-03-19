// Global HTTP interceptor to inject JWT tokens into all outgoing requests
//#region Imports
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
//#endregion
 
//#region Interceptor
/**
 * Intercepts HTTP requests to add Authorization header
 * @param req  - The outgoing request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP event stream
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }

    return next(req).pipe(
        catchError((error) => {
            // Only redirect to login for 401s on protected routes, not on login/register itself
            const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
            if (error.status === 401 && !isAuthEndpoint) {
                localStorage.removeItem('token');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
//#endregion
