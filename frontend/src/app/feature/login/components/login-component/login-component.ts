/**
 * @file login-component.ts
 * @description Manages user authentication interface and form submission
 */
// #region Imports
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
// #endregion
// Only saksoft.com and gmail.com emails are allowed
const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.@]+$/;
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
    /**
     * Initializes the component with form builders and authentication dependencies
     */
    // #region constructor
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }
    // #endregion
    /**
     * Getter for the email form control
     * Utilized for template validation and state tracking
     */
    // #region email
    public get email() {
        return this.loginForm.get('email')!;
    }
    // #endregion
    /**
     * Getter for the password form control
     * Utilized for template validation and state tracking
     */
    // #region password
    public get password() {
        return this.loginForm.get('password')!;
    }
    // #endregion
    /**
     * Processes form submission and initiates the login sequence
     * Redirects to dashboard on success or displays browser alert on failure
     */
    // #region onSubmit
    public onSubmit(): void {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                alert('Login successful');
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                const message = error.status === 401 ? 'Invalid credentials' : 'Something went wrong';
                alert(message);
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            },
        });
    }
    // #endregion
}
