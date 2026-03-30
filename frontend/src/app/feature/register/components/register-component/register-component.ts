/**
 * @file register-component.ts
 * @description Manages new user account registration and validation infrastructure
 */
// #region Imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../login/service/auth-service';
// #endregion

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

/**
 * @summary Registration interaction controller
 * Provides a secure form for new users, enforces domain-specific email constraints, and manages registration state
 */
@Component({
    selector: 'app-register-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register-component.html',
})
export class RegisterComponent {
    public registerForm: FormGroup;
    public loading = false;

    // #region constructor
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|saksoft\.com)$/)]],
            password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
        });
    }
    // #endregion

    // #region username
    public get username() {
        return this.registerForm.get('username')!;
    }
    // #endregion

    // #region email
    public get email() {
        return this.registerForm.get('email')!;
    }
    // #endregion

    // #region password
    public get password() {
        return this.registerForm.get('password')!;
    }
    // #endregion

    // #region onSubmit
    public onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            if (this.password.invalid) {
                alert('Password must contain uppercase, lowercase, number, and special character');
            } else if (this.email.invalid) {
                alert('Enter a valid email (only @gmail.com or @saksoft.com allowed)');
            }
            return;
        }
        this.loading = true;
        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.loading = false;
                alert('Account created successfully');
                this.router.navigate(['/login']);
            },
            error: (error) => {
                const msg = error?.error?.detail?.toLowerCase() || '';
                if (msg.includes('username') && msg.includes('email')) {
                    alert('Username and Email already exist');
                } else if (msg.includes('username')) {
                    alert('Username already exists');
                } else if (msg.includes('email')) {
                    alert('Email already exists');
                } else {
                    alert('Something went wrong');
                }
                this.registerForm.reset();
                this.loading = false;
            },
        });
    }
    // #endregion
}
