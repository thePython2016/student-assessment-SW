import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface DepartmentOption {
  id: number;
  departmentName_: string;
}

export interface InstructorData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department: number | null;
}

@Component({
  selector: 'app-instructor-edit-dialog',
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Update Instructor</h2>

    <form #f="ngForm" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">

        @if (loading) {
          <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
        } @else {
          @if (error) { <p class="error">{{ error }}</p> }

          <div class="row">
            <mat-form-field appearance="outline" class="half">
              <mat-label>First Name</mat-label>
              <input matInput [(ngModel)]="model.first_name" name="first_name" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="half">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="model.last_name" name="last_name" required>
            </mat-form-field>
          </div>
          @if (errors['first_name']) { <p class="field-error">{{ errors['first_name'][0] }}</p> }
          @if (errors['last_name']) { <p class="field-error">{{ errors['last_name'][0] }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="model.email" name="email" required
                   (input)="errors['email'] = []">
          </mat-form-field>
          @if (errors['email']) { <p class="field-error">{{ errors['email'][0] }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Phone</mat-label>
            <input matInput type="tel" [(ngModel)]="model.phone" name="phone" required>
          </mat-form-field>
          @if (errors['phone']) { <p class="field-error">{{ errors['phone'][0] }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Address</mat-label>
            <input matInput [(ngModel)]="model.address" name="address" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="model.department" name="department" required>
              @for (d of departments; track d.id) {
                <mat-option [value]="d.id">{{ d.departmentName_ }}</mat-option>
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
    .dialog-body { display: flex; flex-direction: column; min-width: 420px; padding-top: 8px; }
    .row { display: flex; gap: 12px; }
    .half { flex: 1; }
    .full { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .error { padding: 10px 14px; border-radius: 6px; margin: 0 0 12px; background: #ffebee; color: #c62828; font-size: 14px; }
    .field-error { color: #c62828; font-size: 13px; margin: -12px 0 12px 4px; }
    @media (max-width: 600px) { .dialog-body { min-width: 0; } .row { flex-direction: column; gap: 0; } }
  `],
})
export class InstructorEditDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<InstructorEditDialog>);
  private data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  base = 'http://127.0.0.1:8000';

  model: InstructorData = {
    id: this.data.id, first_name: '', last_name: '',
    email: '', phone: '', address: '', department: null,
  };
  departments: DepartmentOption[] = [];
  errors: Record<string, string[]> = {};
  error = '';
  loading = true;
  saving = false;

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    try {
      const [instRes, deptRes] = await Promise.all([
        fetch(`${this.base}/instructor/${this.data.id}/`),
        fetch(`${this.base}/department/`),
      ]);

      if (instRes.ok && deptRes.ok) {
        this.model = await instRes.json();
        this.departments = await deptRes.json();
      } else {
        this.error = 'Could not load this instructor';
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
    this.errors = {};
    this.saving = true;
    try {
      const response = await fetch(`${this.base}/instructor/${this.model.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: this.model.first_name,
          last_name: this.model.last_name,
          email: this.model.email,
          phone: this.model.phone,
          address: this.model.address,
          department: this.model.department,
        }),
      });

      if (response.ok) {
        this.dialogRef.close(await response.json());
      } else if (response.status === 400) {
        this.errors = await response.json();
      } else {
        this.error = 'Could not update instructor';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}