/**
 * @file register-component.ts
 * @description Manages new user account registration and validation infrastructure
 */
// #region Imports
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../login/service/auth-service';
// #endregion
// Only saksoft.com and gmail.com emails are allowed
const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.@]+$/;
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
        this.registerForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]+$')]],
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }
    // #endregion
    /**
     * Getter for the username form control
     * Utilized for template validation and state tracking
     */
    // #region username
    public get username() {
        return this.registerForm.get('username')!;
    }
    // #endregion
    /**
     * Getter for the email form control
     * Utilized for template validation and state tracking
     */
    // #region email
    public get email() {
        return this.registerForm.get('email')!;
    }
    // #endregion
    /**
     * Getter for the password form control
     * Utilized for template validation and state tracking
     */
    // #region password
    public get password() {
        return this.registerForm.get('password')!;
    }
    // #endregion
    /**
     * Processes form submission and initiates the registration sequence
     * Redirects to login view on success or displays browser alert on failure
     */
    // #region onSubmit
    public onSubmit(): void {
        if (this.registerForm.invalid) return;
        this.loading = true;
        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                alert('Account created successfully');
                this.loading = false;
                this.router.navigate(['/login']);
            },
            error: (error) => {
                const message = error.status === 400 ? 'Email already exists' : 'Something went wrong';
                alert(message);
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            },
        });
    }
    // #endregion
}
