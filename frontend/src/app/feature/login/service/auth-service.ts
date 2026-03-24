/**
 * @file auth-service.ts
 * @description Orchestrates authentication workflows and session persistence logic
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
    /**
     * Injects dependencies for HTTP communication and navigation
     */
    // #region constructor
    constructor(private httpClient: HttpClient, private router: Router) {
    }
    // #endregion
    /**
     * Submits new user data to the registration endpoint
     * @param userData Payload containing username, email, and password
     */
    // #region register
    public register(userData: RegisterData): Observable<User> {
        return this.httpClient.post<User>(`${this.authUrl}/register`, userData);
    }
    // #endregion
    /**
     * Authenticates existing user and persists the returned JWT token
     * @param credentials Payload containing email and password
     */
    // #region login
    public login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.httpClient.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
            tap((response: AuthResponse) => {
                if (response.access_token) {
                    localStorage.setItem('token', response.access_token);
                }
            })
        );
    }
    // #endregion
    /**
     * Clears authentication session and redirects to the login view
     */
    // #region logout
    public logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
    // #endregion
    /**
     * Retrieves the current stored access token
     * @returns JWT string or null if not authenticated
     */
    // #region getToken
    public getToken(): string | null {
        return localStorage.getItem('token');
    }
    // #endregion
    /**
     * Verifies if a user session is active
     * @returns boolean indicating login state
     */
    // #region isLoggedIn
    public isLoggedIn(): boolean {
        return !!this.getToken();
    }
    // #endregion
}
