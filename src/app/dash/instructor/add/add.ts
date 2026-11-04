import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgForm } from '@angular/forms';


interface DepartmentOption {
  id: number;
  departmentName_: string;
}

interface InstructorData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department: number;
}

@Component({
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  selector: 'app-add',
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';
  endPoint = 'instructor';

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  department: number | null = null;

  departments: DepartmentOption[] = [];
  error = '';
  success = '';

  ngOnInit() {
    this.loadDepartments();
  }

  async loadDepartments() {
    try {
      const response = await fetch(`${this.base}/department/`);
      if (response.ok) {
        this.departments = await response.json();
      } else {
        this.error = 'Could not load departments';
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.cdr.markForCheck();
    }
  }

  async onSubmit(form: NgForm) {
    this.error = '';
    this.success = '';

    const data: InstructorData = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      department: this.department as number,
    };

    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        this.success = 'Instructor added successfully';
         form.resetForm();


   setTimeout(() => {
    this.success = '';
    this.cdr.detectChanges();
  }, 3000);   // 3000 = 3 seconds
  
      } else {
        this.error = result.email;
           setTimeout(() => {
    this.success = '';
    this.cdr.detectChanges();
  }, 3000);   // 3000 = 3 seconds
  
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.cdr.markForCheck();
    }
  }
}