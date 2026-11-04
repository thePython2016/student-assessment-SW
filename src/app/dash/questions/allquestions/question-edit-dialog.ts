import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-question-edit-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  styles: [`
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full, mat-form-field { width: 100%; }
    .msg { padding: 10px 14px; border-radius: 8px; background: #fdecea; color: #b3261e; }
    .green-btn {
      --mdc-filled-button-container-color: #15874f;
      --mdc-filled-button-label-text-color: #fff;
      --mat-button-filled-container-color: #15874f;
      --mat-button-filled-label-text-color: #fff;
    }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
  `],
  template: `
    <h2 mat-dialog-title>Edit Question #{{ data.id }}</h2>

    <mat-dialog-content>
      <form id="editForm" #f="ngForm" (ngSubmit)="save(f)" novalidate>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Course</mat-label>
          <input matInput [value]="courseName" disabled />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Question</mat-label>
          <textarea matInput name="text" [(ngModel)]="model.text" rows="4" required minlength="3" #text="ngModel"></textarea>
          @if (text.invalid) { <mat-error>Enter the question (at least 3 characters).</mat-error> }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Topic</mat-label>
            <input matInput name="topic" [(ngModel)]="model.topic" required #topic="ngModel" />
            @if (topic.invalid) { <mat-error>Enter a topic.</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select name="type" [(ngModel)]="model.type" required>
              @for (t of types; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Difficulty</mat-label>
            <mat-select name="difficulty" [(ngModel)]="model.difficulty" required>
              @for (l of levels; track l) { <mat-option [value]="l">{{ l }}</mat-option> }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Marks</mat-label>
            <input matInput type="number" name="marks" [(ngModel)]="model.marks" min="1" required #marks="ngModel" />
            @if (marks.invalid) { <mat-error>Marks must be at least 1.</mat-error> }
          </mat-form-field>
        </div>
      </form>

      @if (error) { <div class="msg" role="alert">{{ error }}</div> }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()" [disabled]="saving">Cancel</button>
      <button mat-flat-button class="green-btn" type="submit" form="editForm" [disabled]="saving || loading">
        {{ saving ? 'Saving...' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class QuestionEditDialog implements OnInit {
  private ref = inject(MatDialogRef<QuestionEditDialog>);
  private cdr = inject(ChangeDetectorRef);
  data = inject<{ id: number }>(MAT_DIALOG_DATA);

  base = 'https://student-assessment-4ipf.onrender.com  ';
  endPoint = 'question-bank';

  courseName = '';
  types = ['MCQ', 'True/False', 'Short answer'];
  levels = ['Easy', 'Medium', 'Hard'];
  loading = true;
  saving = false;
  error = '';

  // Same keys as the serializer fields.
  model = {
    courseId: null as number | null,
    text: '',
    topic: '',
    type: 'MCQ',
    difficulty: 'Easy',
    marks: 1,
  };

  async ngOnInit() {
    await this.loadQuestion();
    this.loading = false;
    this.cdr.markForCheck();
  }

  async loadQuestion() {
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.data.id}`);
      if (response.ok) {
        const q = await response.json();
        this.courseName = q.course_name;
        this.model = {
          courseId: q.courseId,
          text: q.text,
          topic: q.topic,
          type: q.type,
          difficulty: q.difficulty,
          marks: q.marks,
        };
      } else {
        this.error = 'Could not load the question';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    }
  }

  async save(form: NgForm) {
    if (form.invalid) { form.control.markAllAsTouched(); return; }

    this.saving = true;
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.model),
      });

      if (response.ok) {
        this.ref.close(true);
        return;
      }
      this.error = 'Could not update the question';
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  close() {
    this.ref.close(false);
  }
}