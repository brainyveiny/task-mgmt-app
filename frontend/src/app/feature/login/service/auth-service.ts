/**
 * @file auth-service.ts
 * @description Orchestrates authentication workflows and session persistence logic
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../../../types/constants';
import { AuthResponse, User, LoginCredentials, RegisterData } from '../../../types/interface';

/**
 * @summary Authentication business logic provider
 * Manages API communication for login/registration and handles JWT token lifecycle in local storage
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly authUrl = `${APP_CONFIG.apiUrl}/auth`;

    // #region constructor
    constructor(private httpClient: HttpClient) {}
    // #endregion

    // #region register
    public register(userData: RegisterData): Observable<User> {
        return this.httpClient.post<User>(`${this.authUrl}/register`, userData);
    }
    // #endregion

    // #region login
    public login(credentials: LoginCredentials): Observable<AuthResponse> {
        const formData = new FormData();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);
        return this.httpClient.post<AuthResponse>(`${this.authUrl}/login`, formData).pipe(
            tap((response: AuthResponse) => {
                if (response.access_token) {
                    localStorage.setItem('token', response.access_token);
                }
            })
        );
    }
    // #endregion

    // #region logout
    public logout(): void {
        localStorage.removeItem('token');
    }
    // #endregion

    // #region getToken
    public getToken(): string | null {
        return localStorage.getItem('token');
    }
    // #endregion

    // #region isLoggedIn
    public isLoggedIn(): boolean {
        // Validates both token presence and the JWT expiry claim to prevent stale sessions
        const token = this.getToken();
        if (!token) {
            return false;
        }
        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) {
                return false;
            }
            const payload = JSON.parse(atob(payloadBase64));
            const expiry: number = payload.exp;
            if (!expiry) {
                return false;
            }
            return Math.floor(Date.now() / 1000) < expiry;
        } catch {
            // Malformed token — treat as logged out
            localStorage.removeItem('token');
            return false;
        }
    }
    // #endregion

    // #region getCurrentUser
    public getCurrentUser() {
        return this.httpClient.get<any>(`${this.authUrl}/me`);
    }
    // #endregion
}
