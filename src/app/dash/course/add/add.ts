import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface DepartmentOption {
  id: number;
  departmentName_: string;
}

interface InstructorOption {
  id: number;
  first_name: string;
  last_name: string;
  department: number;
}

@Component({
  selector: 'app-add',
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
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';

  courseName = '';
  courseCode = '';
  department: number | null = null;
  credits: number | null = null;
  instructor: number | null = null;
  description = '';

  departments: DepartmentOption[] = [];
  instructors: InstructorOption[] = [];

  errors: Record<string, string[]> = {};
  error = '';
  success = '';

  get filteredInstructors(): InstructorOption[] {
    return this.instructors.filter((i) => i.department === this.department);
  }

  ngOnInit() {
    this.loadOptions();
  }

  async loadOptions() {
    try {
      const [deptRes, instRes] = await Promise.all([
        fetch(`${this.base}/department/`),
        fetch(`${this.base}/instructor/`),
      ]);
      if (deptRes.ok && instRes.ok) {
        this.departments = await deptRes.json();
        this.instructors = await instRes.json();
      } else {
        this.error = 'Could not load departments or instructors';
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.cdr.markForCheck();
    }
  }

  onDepartmentChange() {
    this.instructor = null;
    this.errors['instructor'] = [];
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.errors = {};
    this.error = '';
    this.success = '';

    const data = {
      course_name: this.courseName,
      course_code: this.courseCode,
      department: this.department,
      credits: this.credits,
      instructor: this.instructor,
      description: this.description,
    };

    try {
      const response = await fetch(`${this.base}/course/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.success = 'Course added successfully';
        form.resetForm();
      } else if (response.status === 400) {
        this.errors = await response.json();
      } else {
        this.error = 'Something went wrong on the server';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }

  onCancel(form: NgForm) {
    form.resetForm();
    this.errors = {};
    this.error = '';
    this.success = '';
  }
}