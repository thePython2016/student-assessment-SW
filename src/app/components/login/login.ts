import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  emailError = '';
  passwordError = '';
  error = '';

  private base = 'https://student-assessment-alis.onrender.com';

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
    this.error = '';
  }

  async onLogin() {
    this.clearErrors();
    let hasError = false;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      hasError = true;
    }
    if (!this.password) {
      this.passwordError = 'Password is required';
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(`${this.base}/api/account/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      if (response.status === 200) {
        this.router.navigate(['/dash/dashboard']);
      } else {
        this.error = 'Invalid email or password';
      }
    } catch (e) {
      this.error = 'Something went wrong. Try again.';
    }
  }
}