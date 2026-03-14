import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../login/service/auth-service';

const emailPattern = /^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$/;
const passwordPattern = /^[a-zA-Z0-9_.]+$/;

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
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]+$')]],
            email: ['', [Validators.required, Validators.pattern(emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72), Validators.pattern(passwordPattern)]],
        });
    }

    get username() { return this.registerForm.get('username')!; }
    get email() { return this.registerForm.get('email')!; }
    get password() { return this.registerForm.get('password')!; }

    onSubmit(): void {
        if (this.registerForm.invalid) return;
        this.loading = true;
        this.errorMessage = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.successMessage = 'Account created!';
                this.loading = false;
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Registration failed. Please try again.';
                this.loading = false;
                // setTimeout(() => this.errorMessage = '', 5000);
            },
        });
    }
}
