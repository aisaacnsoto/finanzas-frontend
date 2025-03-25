import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  verificationForm: FormGroup;
  isLoading = false;
  showVerification = false;
  phoneNumberTaken = false;
  phoneNumberChecked = false;
  invalidCode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]]
    });
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.registerForm): boolean {
    const field = form.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  checkPhoneAvailability() {
    const phoneControl = this.registerForm.get('phone_number');
    if (phoneControl?.valid) {
      this.isLoading = true;
      this.phoneNumberChecked = false;
      this.authService.checkPhoneAvailability(phoneControl.value)
        .subscribe({
          next: (isAvailable) => {
            this.phoneNumberTaken = !isAvailable;
            this.phoneNumberChecked = true;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.phoneNumberChecked = false;
          }
        });
    }
  }

  onSubmit() {
    if (this.registerForm.valid && !this.phoneNumberTaken) {
      this.isLoading = true;
      const phone = this.registerForm.get('phone_number')?.value;

      this.authService.sendVerificationCode(phone)
        .subscribe({
          next: () => {
            this.showVerification = true;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            // Handle error
          }
        });
    }
  }

  verifyCode() {
    if (this.verificationForm.valid) {
      this.isLoading = true;
      const code = this.verificationForm.get('code')?.value;

      this.authService.verifyCode(code)
        .subscribe({
          next: (isValid) => {
            if (isValid) {
              this.completeRegistration();
            } else {
              this.invalidCode = true;
              this.isLoading = false;
            }
          },
          error: () => {
            this.isLoading = false;
            // Handle error
          }
        });
    }
  }

  resendCode() {
    this.isLoading = true;
    const phone = this.registerForm.get('phone_number')?.value;

    this.authService.sendVerificationCode(phone)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.invalidCode = false;
          this.verificationForm.reset();
        },
        error: () => {
          this.isLoading = false;
          // Handle error
        }
      });
  }

  private completeRegistration() {
    const userData: User = this.registerForm.value;

    this.authService.register(userData)
      .subscribe({
        next: (response) => {
          // Here you would typically store the user token in localStorage
          // and handle the user session
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          // Handle error
        }
      });
  }
}
