/**
 * @file app.routes.ts
 * @description Defines application navigation structure and security constraints
 */
import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './feature/login/service/auth-service';

/**
 * Navigation guard ensuring authenticated access to protected features
 * @returns boolean indicating if navigation can proceed
 */

// #region authGuard
const authGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }
    router.navigate(['/login']);
    return false;
};
// #endregion

/**
 * @summary Primary routing manifest
 * Maps URL paths to components and attaches security guards where required
 * All feature components are lazy-loaded for faster initial bundle size
 */

// #region routes
export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

    {
        path: 'login',
        loadComponent: () =>
            import('./feature/login/components/login-component/login-component')
                .then(m => m.LoginComponent),
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./feature/register/components/register-component/register-component')
                .then(m => m.RegisterComponent),
    },

    {
        path: 'dashboard',
        loadComponent: () =>
            import('./feature/dashboard/components/dashboard-component/dashboard-component')
                .then(m => m.DashboardComponent),
        canActivate: [authGuard],
    },

    {
        path: 'tasks/new',
        loadComponent: () =>
            import('./feature/task-form/components/task-form-component/task-form-component')
                .then(m => m.TaskFormComponent),
        canActivate: [authGuard],
    },

    {
        path: 'tasks/:id/edit',
        loadComponent: () =>
            import('./feature/task-form/components/task-form-component/task-form-component')
                .then(m => m.TaskFormComponent),
        canActivate: [authGuard],
    },

    { path: '**', redirectTo: '/dashboard' },
];
// #endregion
