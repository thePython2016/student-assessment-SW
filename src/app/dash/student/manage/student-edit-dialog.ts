import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: Date | null;
  gender: string;
  course: string;
}

@Component({
  selector: 'app-student-edit-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Update Student</h2>

    <form #f="ngForm" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">

        @if (loading) {
          <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
        } @else {
          @if (error) { <p class="error">{{ error }}</p> }

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput [(ngModel)]="model.first_name" name="first_name" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="model.last_name" name="last_name" required>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="model.email" name="email" required email>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="model.phone" name="phone" required>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput [(ngModel)]="model.address" name="address">
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="model.date_of_birth" name="date_of_birth">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select [(ngModel)]="model.gender" name="gender" required>
                @for (g of genders; track g) {
                  <mat-option [value]="g">{{ g }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="model.course" name="course" required>
              @for (c of courses; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit"
                [disabled]="loading || f.invalid || saving">
          <mat-icon>save</mat-icon> Save
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-body { display: flex; flex-direction: column; min-width: 520px; padding-top: 8px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .error { padding: 10px 14px; border-radius: 6px; margin: 0 0 12px; background-color: #ffebee; color: #c62828; font-size: 14px; }
    @media (max-width: 600px) {
      .dialog-body { min-width: 0; }
      .row { flex-direction: column; gap: 0; }
    }
  `],
})
export class StudentEditDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<StudentEditDialog>);
  private data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-alis.onrender.com';
  endPoint = 'students';

  genders = ['Male', 'Female', 'Other'];
  courses: string[] = [];

  model: StudentData = {
    id: this.data.id,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: null,
    gender: '',
    course: '',
  };
  loading = true;
  saving = false;
  error = '';

  ngOnInit() {
    this.loadStudent();
  }

  private parseDate(s: string | null): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d); // local date, avoids timezone shift
  }

  private formatDate(d: Date | null): string | null {
    if (!d) return null;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  async loadStudent() {
    this.loading = true;
    this.error = '';
    try {
      const [studentRes, courseRes] = await Promise.all([
        fetch(`${this.base}/${this.endPoint}/${this.data.id}/`),
        fetch(`${this.base}/course/`),
      ]);

      if (courseRes.ok) {
        const courses = await courseRes.json();
        this.courses = courses.map((c: any) => c.course_name);
      }

      if (studentRes.ok) {
        const s = await studentRes.json();
        this.model = { ...s, date_of_birth: this.parseDate(s.date_of_birth) };
      } else {
        this.error = 'Could not load this student';
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async save() {
    this.error = '';
    this.saving = true;
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.model.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: this.model.first_name,
          last_name: this.model.last_name,
          email: this.model.email,
          phone: this.model.phone,
          address: this.model.address,
          date_of_birth: this.formatDate(this.model.date_of_birth),
          gender: this.model.gender,
          course: this.model.course,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        this.dialogRef.close(result);
      } else {
        this.error = JSON.stringify(result);
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}