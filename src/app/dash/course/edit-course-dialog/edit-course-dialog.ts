import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Course } from '../manage/manage';

@Component({
  selector: 'app-edit-course-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './edit-course-dialog.html',
  styleUrl: './edit-course-dialog.css'
})
export class EditCourseDialog {

  course: Course;
  departments = ['Computer Science', 'Business Administration', 'Engineering', 'Arts', 'Sciences'];
  durations = ['3 Months', '6 Months', '1 Year', '2 Years', '4 Years'];

  constructor(
    public dialogRef: MatDialogRef<EditCourseDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Course
  ) {
    this.course = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.course);
  }
}