import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  email = '';
  phone = '';
  address = '';
  password = '';
  repeatPassword = '';

  onSignup() {
    if (this.password !== this.repeatPassword) {
      console.error('Passwords do not match');
      return;
    }
    console.log({
      email: this.email,
      phone: this.phone,
      address: this.address,
      password: this.password
    });
  }
}