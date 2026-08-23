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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  selector: 'app-create',
  styleUrl: './create.css',
  templateUrl: './create.html',
})
export class Create {

  title = '';
  type = '';
  course = '';
  duration: number | null = null;
  totalMarks: number | null = null;
  deadline: Date | null = null;
  numberOfQuestions: number | null = null;

  types = ['Quiz', 'Exam', 'Assignment'];
  courses = ['Computer Science', 'Business Administration', 'Engineering', 'Arts', 'Sciences'];

  onSubmit() {
    const newAssessment = {
      title: this.title,
      type: this.type,
      course: this.course,
      duration: this.duration,
      totalMarks: this.totalMarks,
      deadline: this.deadline,
      numberOfQuestions: this.numberOfQuestions
    };

    console.log('New assessment:', newAssessment);
    // TODO: send to backend service
  }

  onCancel() {
    this.title = '';
    this.type = '';
    this.course = '';
    this.duration = null;
    this.totalMarks = null;
    this.deadline = null;
    this.numberOfQuestions = null;
  }
}