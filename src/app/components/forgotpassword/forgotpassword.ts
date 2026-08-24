import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './forgotpassword.html',
  styleUrl: './forgotpassword.css'
})
export class ForgotPassword {

  email = '';

  emailError = '';
  error = '';
  successMessage = '';

  private base = 'http://127.0.0.1:8000';

  constructor(private router: Router) {}

  private clearErrors(): void {
    this.emailError = '';
    this.error = '';
    this.successMessage = '';
  }

  async onResetPassword(): Promise<void> {
    this.clearErrors();

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      return;
    }

    try {
      const response = await fetch(`${this.base}/api/account/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email.trim() })
      });

      const data = await response.json();

      if (response.status === 200) {
        this.successMessage = 'A reset link has been sent to your email.';
      } else {
        this.error = data.detail || 'Unable to send reset link. Please try again.';
      }
    } catch (e: any) {
      this.error = 'Something went wrong. Try again.';
    }
  }
}