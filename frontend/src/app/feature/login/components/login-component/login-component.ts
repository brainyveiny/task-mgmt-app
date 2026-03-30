/**
 * @file login-component.ts
 * @description Manages user authentication interface and form submission
 */
// #region Imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
// #endregion

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

/**
 * @summary Login interaction controller
 * Provides interactive form for user credentials, validates input, and orchestrates authentication via AuthService
 */
@Component({
    selector: 'app-login-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login-component.html',
})
export class LoginComponent {
    public loginForm: FormGroup;
    public loading = false;

    // #region constructor
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|saksoft\.com)$/)]],
            password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
        });
    }
    // #endregion

    // #region email
    public get email() {
        return this.loginForm.get('email')!;
    }
    // #endregion

    // #region password
    public get password() {
        return this.loginForm.get('password')!;
    }
    // #endregion

    // #region onSubmit
    public onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            if (this.password.invalid) {
                alert('Password must have uppercase, lowercase, number, and special character');
            } else if (this.email.invalid) {
                alert('Enter a valid email (only @gmail.com or @saksoft.com allowed)');
            }
            return;
        }
        this.loading = true;
        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                alert('Login successful');
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                const message =
                    error.status === 401
                        ? 'Invalid email or password'
                        : 'Something went wrong';
                alert(message);
                this.loading = false;
            },
        });
    }
    // #endregion
}
