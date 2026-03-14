import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterComponent } from './register-component';
import { environment } from '../../../../environments/environment';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let httpMock: HttpTestingController;
    let router: Router;

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

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('form initialization', () => {
        it('should create a form with username, email, and password fields', () => {
            expect(component.registerForm.contains('username')).toBeTrue();
            expect(component.registerForm.contains('email')).toBeTrue();
            expect(component.registerForm.contains('password')).toBeTrue();
        });

        it('should initialize with empty values', () => {
            expect(component.registerForm.get('username')?.value).toBe('');
            expect(component.registerForm.get('email')?.value).toBe('');
            expect(component.registerForm.get('password')?.value).toBe('');
        });

        it('should start with loading as false', () => {
            expect(component.loading).toBeFalse();
        });

        it('should start with empty error and success messages', () => {
            expect(component.errorMessage).toBe('');
            expect(component.successMessage).toBe('');
        });
    });

    describe('form validation', () => {
        it('should mark username as invalid when empty', () => {
            component.registerForm.get('username')?.setValue('');
            expect(component.registerForm.get('username')?.valid).toBeFalse();
        });

        it('should mark username as invalid when less than 3 characters', () => {
            component.registerForm.get('username')?.setValue('ab');
            expect(component.registerForm.get('username')?.valid).toBeFalse();
        });

        it('should mark username as invalid with special characters', () => {
            component.registerForm.get('username')?.setValue('user@name');
            expect(component.registerForm.get('username')?.valid).toBeFalse();
        });

        it('should mark username as valid with alphanumeric and underscore', () => {
            component.registerForm.get('username')?.setValue('user_name123');
            expect(component.registerForm.get('username')?.valid).toBeTrue();
        });

        it('should mark email as invalid for non-allowed domain', () => {
            component.registerForm.get('email')?.setValue('user@yahoo.com');
            expect(component.registerForm.get('email')?.valid).toBeFalse();
        });

        it('should mark email as valid for @gmail.com', () => {
            component.registerForm.get('email')?.setValue('user@gmail.com');
            expect(component.registerForm.get('email')?.valid).toBeTrue();
        });

        it('should mark email as valid for @saksoft.com', () => {
            component.registerForm.get('email')?.setValue('employee@saksoft.com');
            expect(component.registerForm.get('email')?.valid).toBeTrue();
        });

        it('should mark password as invalid when less than 6 characters', () => {
            component.registerForm.get('password')?.setValue('12345');
            expect(component.registerForm.get('password')?.valid).toBeFalse();
        });

        it('should mark password as valid with allowed characters', () => {
            component.registerForm.get('password')?.setValue('pass_1.a');
            expect(component.registerForm.get('password')?.valid).toBeTrue();
        });

        it('should mark password as invalid with special characters', () => {
            component.registerForm.get('password')?.setValue('pass@123');
            expect(component.registerForm.get('password')?.valid).toBeFalse();
        });

        it('should mark the entire form as invalid with empty fields', () => {
            expect(component.registerForm.valid).toBeFalse();
        });

        it('should mark the entire form as valid with proper values', () => {
            component.registerForm.setValue({
                username: 'testuser',
                email: 'user@gmail.com',
                password: 'password123',
            });
            expect(component.registerForm.valid).toBeTrue();
        });
    });

    describe('onSubmit', () => {
        it('should not submit when form is invalid', () => {
            component.onSubmit();
            httpMock.expectNone(`${environment.apiUrl}/auth/register`);
        });

        it('should set loading to true on submit', () => {
            component.registerForm.setValue({
                username: 'testuser',
                email: 'user@gmail.com',
                password: 'password123',
            });
            component.onSubmit();
            expect(component.loading).toBeTrue();
            httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush({});
        });

        it('should navigate to login on successful registration', () => {
            spyOn(router, 'navigate');
            component.registerForm.setValue({
                username: 'testuser',
                email: 'user@gmail.com',
                password: 'password123',
            });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
            req.flush({ id: 1, username: 'testuser', email: 'user@gmail.com', created_at: '2026-01-01' });

            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            expect(component.successMessage).toBe('Account created!');
            expect(component.loading).toBeFalse();
        });

        it('should set error message on registration failure', () => {
            component.registerForm.setValue({
                username: 'testuser',
                email: 'user@gmail.com',
                password: 'password123',
            });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
            req.flush({ detail: 'Email already registered' }, { status: 400, statusText: 'Bad Request' });

            expect(component.errorMessage).toBe('Email already registered');
            expect(component.loading).toBeFalse();
        });

        it('should show default error message when server error has no detail', () => {
            component.registerForm.setValue({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });
            component.onSubmit();

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
            req.flush({}, { status: 500, statusText: 'Server Error' });

            expect(component.errorMessage).toBe('Registration failed. Please try again.');
        });
    });

    describe('template', () => {
        it('should render the create account heading', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('h2')?.textContent).toContain('Create account');
        });

        it('should have username, email, and password input fields', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#username')).toBeTruthy();
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
            expect(button.disabled).toBeTrue();
        });

        it('should have a link to login page', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const link = compiled.querySelector('a[routerLink="/login"]');
            expect(link).toBeTruthy();
        });
    });
});
