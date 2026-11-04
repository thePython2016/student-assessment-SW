import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface CourseData {
  id: number;
  course_name: string;
  course_code: string;
  department: string;
  credits: number | null;
  instructor: string;
  description: string;
}

interface DepartmentOption { id: number; departmentName_: string; }
interface InstructorOption { id: number; first_name: string; last_name: string; }

@Component({
  selector: 'app-course-edit-dialog',
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Update Course</h2>

    <form #f="ngForm" (ngSubmit)="save()" novalidate>
      <mat-dialog-content class="dialog-body">

        @if (loading) {
          <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
        } @else {
          @if (error) { <p class="error">{{ error }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Course Name</mat-label>
            <input matInput [(ngModel)]="model.course_name" name="course_name"
                   (input)="clear('course_name')">
          </mat-form-field>
          @if (msg('course_name')) { <p class="field-error">{{ msg('course_name') }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Course Code</mat-label>
            <input matInput [(ngModel)]="model.course_code" name="course_code"
                   (input)="clear('course_code')">
          </mat-form-field>
          @if (msg('course_code')) { <p class="field-error">{{ msg('course_code') }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="model.department" name="department"
                        (selectionChange)="clear('department')">
              @for (d of departments; track d.id) {
                <mat-option [value]="d.departmentName_">{{ d.departmentName_ }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (msg('department')) { <p class="field-error">{{ msg('department') }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Instructor</mat-label>
            <mat-select [(ngModel)]="model.instructor" name="instructor"
                        (selectionChange)="clear('instructor')">
              @for (i of instructors; track i.id) {
                <mat-option [value]="i.first_name + ' ' + i.last_name">
                  {{ i.first_name }} {{ i.last_name }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (msg('instructor')) { <p class="field-error">{{ msg('instructor') }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Credits</mat-label>
            <input matInput type="number" [(ngModel)]="model.credits" name="credits"
                   (input)="clear('credits')">
          </mat-form-field>
          @if (msg('credits')) { <p class="field-error">{{ msg('credits') }}</p> }

          <mat-form-field appearance="outline" class="full">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" [(ngModel)]="model.description" name="description"></textarea>
          </mat-form-field>
          @if (msg('description')) { <p class="field-error">{{ msg('description') }}</p> }
        }

      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="loading || saving">
          <mat-icon>save</mat-icon> Save
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-body { display: flex; flex-direction: column; min-width: 420px; padding-top: 8px; }
    .full { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .error { padding: 10px 14px; border-radius: 6px; margin: 0 0 12px; background: #ffebee; color: #c62828; font-size: 14px; }
    .field-error { color: #c62828; font-size: 13px; margin: -12px 0 12px 4px; }
    @media (max-width: 600px) { .dialog-body { min-width: 0; } }
  `],
})
export class CourseEditDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<CourseEditDialog>);
  private data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';

  model: CourseData = {
    id: this.data.id, course_name: '', course_code: '', department: '',
    credits: null, instructor: '', description: '',
  };
  departments: DepartmentOption[] = [];
  instructors: InstructorOption[] = [];

  errors: Record<string, string[]> = {};
  error = '';
  loading = true;
  saving = false;

  ngOnInit() {
    this.load();
  }

  msg(name: string): string {
    return this.errors[name]?.[0] ?? '';
  }

  clear(name: string) {
    delete this.errors[name];
  }

  async load() {
    try {
      const [courseRes, deptRes, instRes] = await Promise.all([
        fetch(`${this.base}/course/${this.data.id}/`),
        fetch(`${this.base}/department/`),
        fetch(`${this.base}/instructor/`),
      ]);

      if (courseRes.ok && deptRes.ok && instRes.ok) {
        this.model = await courseRes.json();
        this.departments = await deptRes.json();
        this.instructors = await instRes.json();
      } else {
        this.error = 'Could not load this course';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
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
      const response = await fetch(`${this.base}/course/${this.model.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: this.model.course_name,
          course_code: this.model.course_code,
          department: this.model.department,
          credits: this.model.credits,
          instructor: this.model.instructor,
          description: this.model.description,
        }),
      });

      if (response.ok) {
        this.dialogRef.close(await response.json());
      } else if (response.status === 400) {
        this.errors = await response.json();
      } else {
        this.error = 'Could not update course';
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