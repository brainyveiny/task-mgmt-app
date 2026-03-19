// Manages user authentication state and communication with the /auth API
//#region Imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
//#endregion
 
//#region Interfaces

export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
//#endregion
 
//#region Service
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

    // POST /auth/register
    /**
     * Registers a new user account
     * @param data - User registration details (username, email, password)
     * @returns Observable of the created User
     */
    register(data: RegisterRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, data);
    }

    // POST /auth/login → saves token to localStorage
    /**
     * Authenticates user and stores JWT token
     * @param data - Login credentials (email, password)
     * @returns Observable of the authentication response
     */
    login(data: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
            tap((res) => {
                localStorage.setItem('token', res.access_token);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
//#endregion
