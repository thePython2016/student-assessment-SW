import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface DepartmentData {
  id: number;
  departmentCode_: string;
  departmentName_: string;
  description: string;
}

@Component({
  selector: 'app-department-edit-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Update Department</h2>

    <form #f="ngForm" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">

        @if (loading) {
          <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
        } @else {
          @if (error) { <p class="error">{{ error }}</p> }


          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Department Code</mat-label>
            <input matInput [(ngModel)]="model.departmentCode_" name="departmentCode_" required maxlength="20">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Department Name</mat-label>
            <input matInput [(ngModel)]="model.departmentName_" name="departmentName_" required maxlength="100">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="model.description" name="description" rows="3"></textarea>
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
    .dialog-body { display: flex; flex-direction: column; min-width: 380px; padding-top: 8px; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .error { padding: 10px 14px; border-radius: 6px; margin: 0 0 12px; background-color: #ffebee; color: #c62828; font-size: 14px; }
    @media (max-width: 600px) { .dialog-body { min-width: 0; } }
  `],
})
export class DepartmentEditDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<DepartmentEditDialog>);
  private data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  base = 'http://127.0.0.1:8000';
  endPoint = 'department';

  model: DepartmentData = {
    id: this.data.id,
    departmentCode_: '',
    departmentName_: '',
    description: '',
  };
  loading = true;
  saving = false;
  error = '';

  ngOnInit() {
    this.loadDepartment();
  }

  async loadDepartment() {
    this.loading = true;
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.data.id}/`);
      if (response.ok) {
        this.model = await response.json();
      } else {
        this.error = 'Could not load this department';
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
          departmentCode_: this.model.departmentCode_,
          departmentName_: this.model.departmentName_,
          description: this.model.description,
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