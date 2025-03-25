import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simulated user database
  private users = [
    {
      id: 1,
      firstname: 'Test',
      lastname: 'User',
      phone_number: '1234567890',
      email: 'test@example.com',
      password: '123456'
    }
  ];

  private registeredPhones = ['1234567890']; // Simulated database of registered phones
  private verificationCode: string = '';

  constructor() {}

  checkPhoneAvailability(phone: string): Observable<boolean> {
    // Simulate API call delay
    return of(!this.registeredPhones.includes(phone)).pipe(
      delay(1000)
    );
  }

  sendVerificationCode(phone: string): Observable<string> {
    // Generate a random 4-digit code
    this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`Verification code for ${phone}: ${this.verificationCode}`); // For testing purposes
    
    // Simulate API call delay and WhatsApp message sending
    return of(this.verificationCode).pipe(
      delay(1500)
    );
  }

  verifyCode(code: string): Observable<boolean> {
    // Simulate API call delay and code verification
    return of(code === this.verificationCode).pipe(
      delay(1000)
    );
  }

  register(userData: any): Observable<any> {
    // Add user to simulated database
    this.users.push({
      id: Math.floor(Math.random() * 1000),
      ...userData
    });
    this.registeredPhones.push(userData.phone_number);

    // Simulate API call delay and registration
    return of({
      success: true,
      user: userData
    }).pipe(
      delay(1500)
    );
  }

  login(phone_number: string, password: string): Observable<any> {
    // Find user in simulated database
    const user = this.users.find(u => u.phone_number === phone_number && u.password === password);
    
    // Simulate API call delay and login
    return of({
      success: !!user,
      user: user ? { ...user, password: undefined } : null,
      error: user ? null : 'Número de teléfono o contraseña incorrectos'
    }).pipe(
      delay(1000)
    );
  }
}
