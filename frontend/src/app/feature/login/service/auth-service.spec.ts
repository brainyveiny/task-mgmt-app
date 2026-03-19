// Unit tests for the authentication service managing token storage and API communication
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { AuthService, AuthResponse, User } from './auth-service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/auth`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('register', () => {
        it('should send a POST request to /auth/register', () => {
            const mockUser: User = { id: 1, username: 'testuser', email: 'test@example.com', created_at: '2026-01-01' };
            const registerData = { username: 'testuser', email: 'test@example.com', password: 'password123' };

            service.register(registerData).subscribe((user) => {
                expect(user).toEqual(mockUser);
            });

            const req = httpMock.expectOne(`${apiUrl}/register`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(registerData);
            req.flush(mockUser);
        });
    });

    describe('login', () => {
        it('should send a POST request to /auth/login', () => {
            const mockResponse: AuthResponse = { access_token: 'test-token-123', token_type: 'bearer' };
            const loginData = { email: 'test@example.com', password: 'password123' };

            service.login(loginData).subscribe((res) => {
                expect(res).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}/login`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(loginData);
            req.flush(mockResponse);
        });

        it('should store the token in localStorage after login', () => {
            const mockResponse: AuthResponse = { access_token: 'test-token-123', token_type: 'bearer' };

            service.login({ email: 'test@example.com', password: 'password123' }).subscribe(() => {
                expect(localStorage.getItem('token')).toBe('test-token-123');
            });

            const req = httpMock.expectOne(`${apiUrl}/login`);
            req.flush(mockResponse);
        });
    });

    describe('logout', () => {
        it('should remove the token from localStorage', () => {
            localStorage.setItem('token', 'some-token');
            service.logout();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('getToken', () => {
        it('should return the token from localStorage', () => {
            localStorage.setItem('token', 'stored-token');
            expect(service.getToken()).toBe('stored-token');
        });

        it('should return null when no token exists', () => {
            expect(service.getToken()).toBeNull();
        });
    });

    describe('isLoggedIn', () => {
        it('should return true when a token exists', () => {
            localStorage.setItem('token', 'some-token');
            expect(service.isLoggedIn()).toBe(true);
        });

        it('should return false when no token exists', () => {
            expect(service.isLoggedIn()).toBe(false);
        });
    });
});
