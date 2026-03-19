// Register Component: handles new user account creation logic
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../login/service/auth-service';
import { AlertService } from '../../../../shared/alert.service';

// Only saksoft.com and gmail.com emails are allowed
const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.@]+$/;

@Component({
    selector: 'app-register-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register-component.html',
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage = '';
    successMessage = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private alertService: AlertService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]+$')]],
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }

    // Getters for easy template access
    get username() { return this.registerForm.get('username')!; }
    get email() { return this.registerForm.get('email')!; }
    get password() { return this.registerForm.get('password')!; }

    // Called when the form is submitted
    // Validate form and create a new user account
  onSubmit(): void {
        if (this.registerForm.invalid) return;
        this.loading = true;
        this.errorMessage = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.alertService.show('Account created successfully');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Registration failed. Please try again.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }
}
