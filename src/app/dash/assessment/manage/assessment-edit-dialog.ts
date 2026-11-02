import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

interface DateParts { date: Date | null; time: string; }

@Component({
  selector: 'app-edit-assessment-dialog',
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSlideToggleModule, MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  styles: [`
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .datetime { display: grid; grid-template-columns: 1fr 130px; gap: 8px; }
    .full, mat-form-field { width: 100%; }
    .sw { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e4; }
    h3 { margin: 8px 0 4px; font-size: 16px; }
    .msg { margin-top: 8px; padding: 10px 14px; border-radius: 8px; background: #fdecea; color: #b3261e; }
    .green-btn {
      --mdc-filled-button-container-color: #15874f;
      --mdc-filled-button-label-text-color: #fff;
      --mat-button-filled-container-color: #15874f;
      --mat-button-filled-label-text-color: #fff;
    }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
  `],
  template: `
    <h2 mat-dialog-title>Edit Assessment #{{ data.id }}</h2>

    <mat-dialog-content>
      <form id="editForm" #f="ngForm" (ngSubmit)="save(f)" novalidate>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Title</mat-label>
          <input matInput name="title" [(ngModel)]="model.title" required #title="ngModel" />
          @if (title.invalid) { <mat-error>Enter a title.</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Instructions for students</mat-label>
          <textarea matInput name="description" [(ngModel)]="model.description" rows="3"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Course</mat-label>
            <input matInput [value]="courseName" disabled />
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
            <mat-label>Status</mat-label>
            <mat-select name="status" [(ngModel)]="model.status" required>
              <mat-option value="draft">Draft</mat-option>
              <mat-option value="published">Published</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Show results</mat-label>
            <mat-select name="result_visibility" [(ngModel)]="model.result_visibility">
              @for (v of visibility; track v) { <mat-option [value]="v">{{ v }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <div class="datetime">
            <mat-form-field appearance="outline">
              <mat-label>Opens (date)</mat-label>
              <input matInput [matDatepicker]="startPicker" [value]="dt.start.date" readonly
                     (click)="startPicker.open()" (dateChange)="dt.start.date = $event.value; defaultTime(dt.start)" />
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput type="time" name="startTime" [(ngModel)]="dt.start.time" />
            </mat-form-field>
          </div>

          <div class="datetime">
            <mat-form-field appearance="outline">
              <mat-label>Closes (date)</mat-label>
              <input matInput [matDatepicker]="endPicker" [value]="dt.end.date" readonly
                     (click)="endPicker.open()" (dateChange)="dt.end.date = $event.value; defaultTime(dt.end)" />
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput type="time" name="endTime" [(ngModel)]="dt.end.time" />
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Duration (minutes)</mat-label>
            <input matInput type="number" min="1" name="duration" [(ngModel)]="model.duration" required #duration="ngModel" />
            @if (duration.invalid) { <mat-error>At least 1 minute.</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Attempts allowed</mat-label>
            <input matInput type="number" min="1" name="attempts" [(ngModel)]="model.attempts" required #attempts="ngModel" />
            @if (attempts.invalid) { <mat-error>At least 1 attempt.</mat-error> }
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Total marks</mat-label>
            <input matInput type="number" min="1" name="total_marks" [(ngModel)]="model.total_marks" required #total="ngModel" />
            @if (total.invalid) { <mat-error>At least 1 mark.</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Passing marks</mat-label>
            <input matInput type="number" min="0" name="pass_marks" [(ngModel)]="model.pass_marks" required />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Negative marking (per wrong answer)</mat-label>
          <input matInput type="number" min="0" step="0.25" name="negative_marking" [(ngModel)]="model.negative_marking" />
        </mat-form-field>

        <h3>Behaviour</h3>
        <div class="sw"><span>Shuffle questions</span><mat-slide-toggle name="shuffle_questions" [(ngModel)]="model.shuffle_questions"></mat-slide-toggle></div>
        <div class="sw"><span>Shuffle options</span><mat-slide-toggle name="shuffle_options" [(ngModel)]="model.shuffle_options"></mat-slide-toggle></div>
        <div class="sw"><span>Auto-submit when time runs out</span><mat-slide-toggle name="auto_submit" [(ngModel)]="model.auto_submit"></mat-slide-toggle></div>
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
export class EditAssessmentDialog implements OnInit {
  private ref = inject(MatDialogRef<EditAssessmentDialog>);
  private cdr = inject(ChangeDetectorRef);
  data = inject<{ id: number }>(MAT_DIALOG_DATA);

  base = 'http://127.0.0.1:8000';
  endPoint = 'assessments';

  types = ['Quiz', 'Midterm', 'Final', 'Assignment', 'Practice'];
  visibility = ['Immediately', 'After the deadline', 'Hidden until released'];

  courseName = '';
  loading = true;
  saving = false;
  error = '';

  // Same keys as the serializer fields.
  model = {
    title: '',
    description: '',
    type: 'Quiz',
    status: 'draft',
    result_visibility: 'Immediately',
    duration: 60,
    attempts: 1,
    total_marks: 50,
    pass_marks: 25,
    negative_marking: 0,
    shuffle_questions: true,
    shuffle_options: true,
    auto_submit: true,
  };

  dt: { start: DateParts; end: DateParts } = {
    start: { date: null, time: '' },
    end: { date: null, time: '' },
  };

  async ngOnInit() {
    await this.loadAssessment();
    this.loading = false;
    this.cdr.markForCheck();
  }

  async loadAssessment() {
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.data.id}`);
      if (!response.ok) {
        this.error = 'Could not load the assessment';
        return;
      }
      const a = await response.json();
      this.courseName = a.course_name || '';
      this.model = {
        title: a.title,
        description: a.description,
        type: a.type,
        status: a.status,
        result_visibility: a.result_visibility,
        duration: a.duration,
        attempts: a.attempts,
        total_marks: a.total_marks,
        pass_marks: a.pass_marks,
        negative_marking: Number(a.negative_marking),
        shuffle_questions: a.shuffle_questions,
        shuffle_options: a.shuffle_options,
        auto_submit: a.auto_submit,
      };
      this.dt = { start: this.toParts(a.start), end: this.toParts(a.end) };
    } catch (e) {
      this.error = 'Cannot reach the server';
    }
  }

  // ---- date helpers ----
  private pad(n: number) { return String(n).padStart(2, '0'); }

  private toParts(iso: string | null): DateParts {
    if (!iso) return { date: null, time: '' };
    const d = new Date(iso);
    return { date: d, time: `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}` };
  }

  private compose(p: DateParts): string | null {
    if (!p.date || !p.time) return null;
    const d = p.date;
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}T${p.time}`;
  }

  defaultTime(p: DateParts) {
    if (p.date && !p.time) p.time = '08:00';
  }

  // ---- actions ----
  async save(form: NgForm) {
    if (form.invalid) { form.control.markAllAsTouched(); return; }

    this.saving = true;
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${this.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.model,
          start: this.compose(this.dt.start),
          end: this.compose(this.dt.end),
        }),
      });

      if (response.ok) {
        this.ref.close(true);
        return;
      }
      this.error = await this.readError(response);
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  // Shows the first message Django sends back, e.g. "Closing time must be after opening time."
  private async readError(response: Response): Promise<string> {
    const fallback = 'Could not update the assessment';
    try {
      const body = await response.json();
      const messages: string[] = [];
      const walk = (v: any) => {
        if (typeof v === 'string') messages.push(v);
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') Object.values(v).forEach(walk);
      };
      walk(body);
      return messages[0] ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  close() {
    this.ref.close(false);
  }
}