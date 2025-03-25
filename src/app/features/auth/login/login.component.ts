import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = null;

      const { phone_number, password } = this.loginForm.value;

      this.authService.login(phone_number, password)
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Here you would typically store the user token in localStorage
              // and handle the user session
              this.router.navigate(['/dashboard']);
            } else {
              this.loginError = response.error;
            }
            this.isLoading = false;
          },
          error: () => {
            this.loginError = 'Error al iniciar sesión. Por favor, intente nuevamente.';
            this.isLoading = false;
          }
        });
    }
  }
}
