/**
 * @file register-component.spec.ts
 * @description Unit tests for the user registration interface and its associated flows
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RegisterComponent } from './register-component';
import { APP_CONFIG } from '../../../../types/constants';
/**
 * @summary Registration component test suite
 * Verifies form validaton accuracy and successful user creation redirection logic
 */

// #region describe
describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    /**
     * @summary Test environment initialization
     * Initializes component instance and injects essential providers for unit testing
     */

    // #region beforeEach
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });
    // #endregion

    /**
     * @summary Cleanup procedure
     * Verifies that no pending HTTP requests remain after each test case
     */

    // #region afterEach
    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });
    // #endregion

    /**
     * @summary Creation check
     * Confirms that the component is instantiated correctly
     */

    // #region create-test
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    // #endregion

    /**
     * @summary Submission logic tests
     * Verifies successful registration behavior, including backend communication and navigation
     */

    // #region onSubmit-tests
    describe('onSubmit', () => {
        it('should navigate to login on successful registration', () => {
            vi.spyOn(router, 'navigate');
            component.registerForm.setValue({
                username: 'testuser',
                email: 'user@gmail.com',
                password: 'password123',
            });
            component.onSubmit();
            const req = httpMock.expectOne(`${APP_CONFIG.apiUrl}/auth/register`);
            req.flush({ id: 1, username: 'testuser', email: 'user@gmail.com', created_at: '2026-01-01' });
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            expect(component.loading).toBe(false);
        });
    });
    // #endregion

});
// #endregion
