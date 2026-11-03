import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-add',
  imports: [
    CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule,
    MatIconModule, MatDividerModule,
  ],
  providers: [provideNativeDateAdapter()],
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-alis.onrender.com';

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  dob: Date | null = null;
  gender = '';
  course = '';
  res=''
  errorFname=''

  genders = ['Male', 'Female', 'Other'];
  courses: string[] = [];

  errors: Record<string, string[]> = {};
  error = '';
  success = '';

  ngOnInit() {
    this.loadCourses();
  }

  async loadCourses() {
    try {
      const response = await fetch(`${this.base}/course/`);
      if (response.ok) {
        const data = await response.json();
        this.courses = data.map((c: any) => c.course_name);
      }
    } catch (e) {
      this.error = 'Could not load courses';
    } finally {
      this.cdr.markForCheck();
    }
  }

  private formatDate(d: Date | null): string | null {
    if (!d) return null;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  async onSubmit(form: NgForm) {
    this.errors = {};
    this.error = '';
    this.success = '';
    

    const payload = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      date_of_birth: this.formatDate(this.dob),
      gender: this.gender,
      course: this.course,
    };

    try {
      const response = await fetch(`${this.base}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
        const res=await response.json()

      if (response.ok) {
        this.success = 'Student added successfully';

        form.resetForm();
      } 
      else{
        this.error=res;
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }
}