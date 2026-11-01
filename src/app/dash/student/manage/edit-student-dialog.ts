import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  student: any;
  courses: string[];
  base: string;
}

@Component({
  selector: 'app-edit-student-dialog',
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  styles: `
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .full { width: 100%; }
    .error { color: #b00020; margin: 0 0 12px; }
    @media (max-width: 600px) { .row { flex-direction: column; gap: 0; } }
  `,
  template: `
    <form #f="ngForm" (ngSubmit)="save(f)">
      <h2 mat-dialog-title>Update Student</h2>

      <mat-dialog-content>
        @if (error) { <p class="error">{{ error }}</p> }

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>First name</mat-label>
            <input matInput name="firstName" [(ngModel)]="firstName" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last name</mat-label>
            <input matInput name="lastName" [(ngModel)]="lastName" required>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" required email>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput name="phone" [(ngModel)]="phone" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Address</mat-label>
          <input matInput name="address" [(ngModel)]="address">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Date of birth</mat-label>
            <input matInput [matDatepicker]="picker" name="dob" [(ngModel)]="dob">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select name="gender" [(ngModel)]="gender" required>
              @for (g of genders; track g) {
                <mat-option [value]="g">{{ g }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Course</mat-label>
          <mat-select name="course" [(ngModel)]="course" required>
            @for (c of courses; track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()" [disabled]="saving">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="f.invalid || saving">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class EditStudentDialog {
  private cdr = inject(ChangeDetectorRef);
  private ref = inject(MatDialogRef<EditStudentDialog>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  genders = ['Male', 'Female', 'Other'];
  courses = this.data.courses;

  id = this.data.student.id;
  firstName = this.data.student.first_name;
  lastName = this.data.student.last_name;
  email = this.data.student.email;
  phone = this.data.student.phone;
  address = this.data.student.address;
  gender = this.data.student.gender;
  course = this.data.student.course;
  dob: Date | null = this.parseDate(this.data.student.date_of_birth);

  error = '';
  saving = false;

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

  async save(form: NgForm) {
    if (form.invalid) return;
    this.error = '';
    this.saving = true;

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
      const response = await fetch(`${this.data.base}/students/${this.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res = await response.json().catch(() => null);

      if (response.ok) {
        this.ref.close({ ...payload, id: this.id, ...(res ?? {}) });
      } else {
        const detail = res?.detail;
        this.error = typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: any) => `${d.loc?.slice(-1)}: ${d.msg}`).join(', ')
            : 'Could not update student';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  cancel() {
    this.ref.close();
  }
}