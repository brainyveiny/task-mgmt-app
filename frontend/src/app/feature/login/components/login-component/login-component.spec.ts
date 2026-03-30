/**
 * @file login-component.spec.ts
 * @description Unit tests for the user authentication login interface
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { LoginComponent } from './login-component';
import { APP_CONFIG } from '../../../../types/constants';
/**
 * @summary Login component test suite
 * Verifies form validaton and successful authentication redirection
 */

// #region describe
describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    /**
     * @summary Test environment initialization
     * Initializes component and injects core test dependencies
     */

    // #region beforeEach
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });
    // #endregion

    /**
     * @summary Cleanup procedure
     * Verifies no pending HTTP requests and clears session tokens
     */

    // #region afterEach
    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });
    // #endregion

    /**
     * @summary Creation check
     * Verifies the component instance is created successfully
     */

    // #region create-test
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    // #endregion

    /**
     * @summary Submission logic tests
     * Verifies API communication and navigation upon valid credential entry
     */

    // #region onSubmit-tests
    describe('onSubmit', () => {
        it('should navigate to dashboard on successful login', () => {
            vi.spyOn(router, 'navigate');
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'password123' });
            component.onSubmit();
            const req = httpMock.expectOne(`${APP_CONFIG.apiUrl}/auth/login`);
            req.flush({ access_token: 'token', token_type: 'bearer' });
            expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });
    // #endregion

});
// #endregion
