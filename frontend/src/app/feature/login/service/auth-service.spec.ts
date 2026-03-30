/**
 * @file auth-service.spec.ts
 * @description Unit tests for the authentication service managing token logic and API calls
 */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth-service';
import { AuthResponse, User } from '../../../types/interface';
import { APP_CONFIG } from '../../../types/constants';
/**
 * @summary Authentication service test suite
 * Verifies registration, login, logout, and token session management
 */

// #region describe
describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const apiUrl = `${APP_CONFIG.apiUrl}/auth`;
    /**
     * @summary Test environment initialization
     * Configures the testing module and resets session state before each test
     */

    // #region beforeEach
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
    // #endregion

    /**
     * @summary Cleanup procedure
     * Verifies no pending HTTP requests and resets local storage
     */

    // #region afterEach
    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });
    // #endregion

    /**
     * @summary Creation check
     * Verifies service instantiation
     */

    // #region create-test
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    // #endregion

    /**
     * @summary Registration verification
     * Confirms correct API endpoint usage and payload mapping for new user creation
     */

    // #region register-tests
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
    // #endregion

    /**
     * @summary Login verification
     * Confirms credential submission and subsequent JWT token persistence in local storage
     */

    // #region login-tests
    describe('login', () => {
        it('should send a POST request to /auth/login', () => {
            const mockResponse: AuthResponse = { access_token: 'test-token-123', token_type: 'bearer' };
            const loginData = { email: 'test@example.com', password: 'password123' };
            service.login(loginData).subscribe((response) => {
                expect(response).toEqual(mockResponse);
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
    // #endregion

    /**
     * @summary Logout verification
     * Confirms session termination and token removal
     */

    // #region logout-tests
    describe('logout', () => {
        it('should remove the token from localStorage', () => {
            localStorage.setItem('token', 'some-token');
            service.logout();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });
    // #endregion

    /**
     * @summary Token access verification
     * Confirms service correctly retrieves and identifies active sessions
     */

    // #region session-tests
    describe('session monitoring', () => {
        it('should return the token from localStorage via getToken()', () => {
            localStorage.setItem('token', 'stored-token');
            expect(service.getToken()).toBe('stored-token');
        });
        it('should return true for isLoggedIn() when token exists', () => {
            localStorage.setItem('token', 'some-token');
            expect(service.isLoggedIn()).toBe(true);
        });
    });
    // #endregion

});
// #endregion
