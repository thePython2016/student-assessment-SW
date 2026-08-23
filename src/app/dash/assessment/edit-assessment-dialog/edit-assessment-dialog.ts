import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Assessment } from '../manage/manage';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  selector: 'app-edit-assessment-dialog',
  styleUrl: './edit-assessment-dialog.css',
  templateUrl: './edit-assessment-dialog.html',
})
export class EditAssessmentDialog {

  assessment: Assessment;
  types = ['Quiz', 'Exam', 'Test', 'MCQ', 'Assignment'];
  courses = ['Computer Science', 'Business Administration', 'Engineering', 'Arts', 'Sciences'];

  constructor(
    public dialogRef: MatDialogRef<EditAssessmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Assessment
  ) {
    this.assessment = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.assessment);
  }
}