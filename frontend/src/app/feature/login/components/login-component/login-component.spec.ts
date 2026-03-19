// Unit tests for the login component covering form validation and auth service integration
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { LoginComponent } from './login-component';
import { environment } from '../../../../environments/environment';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let httpMock: HttpTestingController;
    let router: Router;

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

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('form initialization', () => {
        it('should create a login form with email and password fields', () => {
            expect(component.loginForm.contains('email')).toBe(true);
            expect(component.loginForm.contains('password')).toBe(true);
        });

        it('should initialize with empty values', () => {
            expect(component.loginForm.get('email')?.value).toBe('');
            expect(component.loginForm.get('password')?.value).toBe('');
        });

        it('should start with loading as false', () => {
            expect(component.loading).toBe(false);
        });

        it('should start with empty error message', () => {
            expect(component.errorMessage).toBe('');
        });
    });

    describe('form validation', () => {
        it('should mark email as invalid when empty', () => {
            component.loginForm.get('email')?.setValue('');
            expect(component.loginForm.get('email')?.valid).toBe(false);
        });

        it('should mark email as invalid for non-allowed domain', () => {
            component.loginForm.get('email')?.setValue('user@yahoo.com');
            expect(component.loginForm.get('email')?.valid).toBe(false);
        });

        it('should mark email as valid for @gmail.com', () => {
            component.loginForm.get('email')?.setValue('user@gmail.com');
            expect(component.loginForm.get('email')?.valid).toBe(true);
        });

        it('should mark email as valid for @saksoft.com', () => {
            component.loginForm.get('email')?.setValue('employee@saksoft.com');
            expect(component.loginForm.get('email')?.valid).toBe(true);
        });

        it('should mark password as invalid when empty', () => {
            component.loginForm.get('password')?.setValue('');
            expect(component.loginForm.get('password')?.valid).toBe(false);
        });

        it('should mark password as invalid when less than 8 characters', () => {
            component.loginForm.get('password')?.setValue('1234567');
            expect(component.loginForm.get('password')?.valid).toBe(false);
        });

        it('should mark password as valid with allowed characters', () => {
            component.loginForm.get('password')?.setValue('Pass_1.ab');
            expect(component.loginForm.get('password')?.valid).toBe(true);
        });

        it('should mark password as invalid with special characters', () => {
            component.loginForm.get('password')?.setValue('pass@123');
            expect(component.loginForm.get('password')?.valid).toBe(false);
        });

        it('should mark the entire form as invalid when fields are empty', () => {
            expect(component.loginForm.valid).toBe(false);
        });

        it('should mark the entire form as valid with proper values', () => {
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'password123' });
            expect(component.loginForm.valid).toBe(true);
        });
    });

    describe('onSubmit', () => {
        it('should not submit when form is invalid', () => {
            component.onSubmit();
            httpMock.expectNone(`${environment.apiUrl}/auth/login`);
        });

        it('should set loading to true on submit', () => {
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'password123' });
            component.onSubmit();
            expect(component.loading).toBe(true);
            httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ access_token: 'token', token_type: 'bearer' });
        });

        it('should navigate to dashboard on successful login', () => {
            vi.spyOn(router, 'navigate');
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'password123' });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            req.flush({ access_token: 'token', token_type: 'bearer' });

            expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
        });

        it('should set error message on login failure', () => {
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'wrongpass1' });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

            expect(component.errorMessage).toBe('Invalid credentials');
            expect(component.loading).toBe(false);
        });

        it('should show default error message when server error has no detail', () => {
            component.loginForm.setValue({ email: 'user@gmail.com', password: 'wrongpass1' });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            req.flush({}, { status: 500, statusText: 'Server Error' });

            expect(component.errorMessage).toBe('Login failed. Please try again.');
        });
    });

    describe('template', () => {
        it('should render the login heading', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('h2')?.textContent).toContain('Login');
        });

        it('should have email and password input fields', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#email')).toBeTruthy();
            expect(compiled.querySelector('#password')).toBeTruthy();
        });

        it('should have a submit button', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const button = compiled.querySelector('button[type="submit"]');
            expect(button).toBeTruthy();
        });

        it('should disable submit button when form is invalid', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
            expect(button.disabled).toBe(true);
        });

        it('should have a link to registration page', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const link = compiled.querySelector('a[routerLink="/register"]');
            expect(link).toBeTruthy();
        });
    });
});
