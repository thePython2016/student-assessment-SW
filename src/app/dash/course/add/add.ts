import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-add',
  imports: [
    CommonModule,
     MatCardModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add {

  courseName = '';
  courseCode = '';
  department = '';
  duration = '';
  credits: number | null = null;
  description = '';
  instructor = '';

  departments = ['Computer Science', 'Business Administration', 'Engineering', 'Arts', 'Sciences'];
  durations = ['3 Months', '6 Months', '1 Year', '2 Years', '4 Years'];

  onSubmit() {
    const newCourse = {
      courseName: this.courseName,
      courseCode: this.courseCode,
      department: this.department,
      duration: this.duration,
      credits: this.credits,
      description: this.description,
      instructor: this.instructor
    };

    console.log('New course:', newCourse);
    // TODO: send to backend service
  }

  onCancel() {
    this.courseName = '';
    this.courseCode = '';
    this.department = '';
    this.duration = '';
    this.credits = null;
    this.description = '';
    this.instructor = '';
  }
}