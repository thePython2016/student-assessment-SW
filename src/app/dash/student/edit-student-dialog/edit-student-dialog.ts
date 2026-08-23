import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Student } from '../manage/manage';

@Component({
  selector: 'app-edit-student-dialog',
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
  templateUrl: './edit-student-dialog.html',
  styleUrl: './edit-student-dialog.css'
})
export class EditStudentDialog {

  student: Student;
  genders = ['Male', 'Female', 'Other'];

  constructor(
    public dialogRef: MatDialogRef<EditStudentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Student
  ) {
    this.student = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.student);
  }
}