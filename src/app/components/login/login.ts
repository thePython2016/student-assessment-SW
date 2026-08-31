import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatCheckboxModule,
    MatProgressSpinnerModule
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
  wrongPass = '';
  invalid = '';
wrongCredentials='';
  isLoading = false;
  isSubmitting=false;
  loginToken='';

  correct='';
  private base = 'http://127.0.0.1:8000';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
    this.error = '';
    this.invalid = '';
    this.wrongCredentials='';
    
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

    this.isLoading = true;

    try {
      const response = await fetch(`${this.base}/api/account/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });
      const result = await response.json();

      if (response.status === 200) {
        this.loginToken=result.token || '';
        sessionStorage.setItem('loginToken',this.loginToken);
        this.router.navigate(['/dash/dashboard']);
        // console.log(result.email)
      } else {
        this.wrongCredentials = result.non_field_errors[0];
      }
    } catch (e) {
      this.error = 'Something went wrong. Try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // ← force Angular to re-render after the async response
    }
  }
}