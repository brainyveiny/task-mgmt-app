// Login component: shows a login form and navigates to dashboard on success
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { AlertService } from '../../../../shared/alert.service';

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
    loginForm: FormGroup;
    errorMessage = '';
    loading = false;

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
}
