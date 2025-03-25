import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  userInfo = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    joinDate: new Date(2024, 0, 15) // 15 de enero de 2024
  };

  passwordForm: FormGroup;
  isLoading = false;
  notification: { type: 'success' | 'error', message: string } | null = null;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.createPasswordForm();
  }

  private createPasswordForm(): FormGroup {
    const form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    return form;
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;

      // Simulamos una llamada al servidor
      setTimeout(() => {
        // Simulamos una respuesta exitosa
        this.isLoading = false;
        this.notification = {
          type: 'success',
          message: 'Contraseña actualizada exitosamente'
        };

        // Limpiamos el formulario
        this.passwordForm.reset();

        // Ocultamos la notificación después de 3 segundos
        setTimeout(() => {
          this.notification = null;
        }, 3000);
      }, 1500);
    }
  }
}
