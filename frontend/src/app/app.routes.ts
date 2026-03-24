/**
 * @file app.routes.ts
 * @description Defines application navigation structure and security constraints
 */
import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './feature/login/service/auth-service';
import { LoginComponent } from './feature/login/components/login-component/login-component';
import { RegisterComponent } from './feature/register/components/register-component/register-component';
import { DashboardComponent } from './feature/dashboard/components/dashboard-component/dashboard-component';
import { TaskFormComponent } from './feature/task-form/components/task-form-component/task-form-component';
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
 */
// #region routes
export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'tasks/new', component: TaskFormComponent, canActivate: [authGuard] },
    { path: 'tasks/:id/edit', component: TaskFormComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/dashboard' },
];
// #endregion
