/**
 * @summary Handles user authentication and session initiation
 * Displays login form, validates credentials via AuthService, and manages navigation
 */
//#region Imports
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { AlertService } from '../../../../shared/alert.service';
//#endregion

// Only saksoft.com and gmail.com emails are allowed
const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.@]+$/;

@Component({
    selector: 'app-login-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login-component.html',
})
export class LoginComponent {
    //#region Properties
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';
    //#endregion

    //#region Methods
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private alertService: AlertService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }

    // Getters for easy template access
    get email() { return this.loginForm.get('email')!; }
    get password() { return this.loginForm.get('password')!; }

    // Called when the form is submitted
    /**
     * Attempts to authenticate the user with current form values
     * @returns void
     */
    // Validate form and send login request to the server
  onSubmit(): void {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.alertService.show('Logged in successfully');
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Login failed. Please try again.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }
    //#endregion
}
