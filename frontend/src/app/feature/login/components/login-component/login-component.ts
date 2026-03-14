import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';

const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.]+$/;

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
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }

    get email() { return this.loginForm.get('email')!; }
    get password() { return this.loginForm.get('password')!; }

    onSubmit(): void {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Login failed. Please try again.';
                this.loading = false;
            },
        });
    }
}
