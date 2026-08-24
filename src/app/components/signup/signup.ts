import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface SignupData {
  email: string;
  phone: string;
  address: string;
  password: string;
}

@Component({
  selector: 'app-signup',
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
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup implements OnInit {

  email = '';
  phone = '';
  address = '';
  password = '';
  repeatPassword = '';
  showPassword = false;
  showRepeatPassword = false;

  emailError = '';
  phoneError = '';
  addressError = '';
  passwordError = '';
  repeatPasswordError = '';
  serverError = '';

  private base = 'http://127.0.0.1:8000';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRepeatPassword(): void {
    this.showRepeatPassword = !this.showRepeatPassword;
  }

  private clearErrors(): void {
    this.emailError = '';
    this.phoneError = '';
    this.addressError = '';
    this.passwordError = '';
    this.repeatPasswordError = '';
    this.serverError = '';
  }

  async onSignup(): Promise<void> {
    this.clearErrors();
    let hasError = false;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      hasError = true;
    }
    if (!this.phone.trim()) {
      this.phoneError = 'Phone is required';
      hasError = true;
    }
    if (!this.address.trim()) {
      this.addressError = 'Address is required';
      hasError = true;
    }
    if (!this.password) {
      this.passwordError = 'Password is required';
      hasError = true;
    }
    if (this.password !== this.repeatPassword) {
      this.repeatPasswordError = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) return;

    const userData: SignupData = {
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      password: this.password
    };

    try {
      const response = await fetch(`${this.base}/api/account/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const status = await response.json();

      if (response.status === 201) {
        this.router.navigate(['/']);
      } else {
        this.serverError = status.detail || 'Signup failed. Please try again.';
      }
    } catch (error: any) {
      this.serverError = `Error: ${error.message}`;
    }
  }
}