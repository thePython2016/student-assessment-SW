import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add',
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class Add {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  dob: Date | null = null;
  gender = '';
  course = '';

  genders = ['Male', 'Female', 'Other'];
  courses = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG'];

  onSubmit() {
    console.log({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      dob: this.dob,
      gender: this.gender,
      course: this.course
    });
  }
}