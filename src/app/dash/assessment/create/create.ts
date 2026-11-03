import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

// ---- Types ----
interface Option { id: number; name: string; }

interface Question {
  id: number;
  text: string;
  topic: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

// Closing time must be after opening time.
function dateRange(g: AbstractControl): ValidationErrors | null {
  const s = g.get('start')?.value, e = g.get('end')?.value;
  return s && e && e <= s ? { dateRange: true } : null;
}

// Passing marks cannot exceed total marks.
function passMax(g: AbstractControl): ValidationErrors | null {
  const t = g.get('totalMarks')?.value, p = g.get('passMarks')?.value;
  return t != null && p != null && p > t ? { passMax: true } : null;
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class Create implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private api = 'http://127.0.0.1:8000';

  types = ['Quiz', 'Midterm', 'Final','Assignment', 'Practice'];
  visibility = ['Immediately', 'After the deadline', 'Hidden until released'];
  levels = ['Easy', 'Medium', 'Hard'];
  // Date picker + time inputs. They fill settings.start / settings.end
  // as 'YYYY-MM-DDTHH:mm', so the validation and the saved data stay the same.
  dt = {
    start: { date: null as Date | null, time: '' },
    end: { date: null as Date | null, time: '' },
  };

  stepNames = ['Basic info', 'Settings', 'Questions', 'Review'];
  step = 0;
  saving = false;
  message = '';
  questionError = '';

  departments: Option[] = [];
  courses: Option[] = [];
  instructors: Option[] = [];
  bank: Question[] = [];
  selected = new Map<number, number>(); // questionId -> marks

  form = this.fb.nonNullable.group({
    basic: this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      departmentId: [0, Validators.min(1)],
      courseId: [0, Validators.min(1)],
      instructorId: [null as number | null],
      type: ['Quiz'],
    }),
    settings: this.fb.nonNullable.group(
      {
        start: ['', Validators.required],
        end: ['', Validators.required],
        duration: [60, [Validators.required, Validators.min(1)]],
        attempts: [1, [Validators.required, Validators.min(1)]],
        totalMarks: [50, [Validators.required, Validators.min(1)]],
        passMarks: [25, [Validators.required, Validators.min(0)]],
        resultVisibility: ['Immediately'],
        negativeMarking: [0, Validators.min(0)],
        shuffleQuestions: [true],
        shuffleOptions: [true],
        autoSubmit: [true],
      },
      { validators: [dateRange, passMax] },
    ),
  });

  filters = this.fb.nonNullable.group({ search: [''], topic: [''], difficulty: [''] });

  get basic() { return this.form.controls.basic; }
  get settings() { return this.form.controls.settings; }

  ngOnInit() {
    // The extra names after "??" are fallbacks if your API uses different fields.
    this.http.get<any[]>(`${this.api}/department`).subscribe((d) =>
      (this.departments = d.map((x) => ({
        id: x.id ?? x.department_id,
        name: x.departmentName_ ?? x.name,
      })), this.cdr.markForCheck()));

    this.http.get<any[]>(`${this.api}/course`).subscribe((c) =>
      (this.courses = c.map((x) => ({
        id: x.id ?? x.id,
        name: x.course_name ?? x.name,
      })), this.cdr.markForCheck()));

    this.http.get<any[]>(`${this.api}/instructor`).subscribe((i) =>
      (this.instructors = i.map((x) => ({
        id: x.id ?? x.instructor_id,
        name: x.first_name ?? x.name,
      })), this.cdr.markForCheck()));

    // Course -> loads its questions from the Question Bank
    this.basic.controls.courseId.valueChanges.subscribe((id) => {
      this.selected.clear();
      this.bank = [];
      if (!id) return;
      const params = new HttpParams().set('courseId', +id);
      this.http.get<Question[]>(`${this.api}/question-bank`, { params }).subscribe((q) => {
        this.bank = q;
        this.cdr.markForCheck();
      });
    });
  }

  // ---- Date and time ----
  onDate(name: 'start' | 'end', date: Date | null) {
    this.dt[name].date = date;
    if (date && !this.dt[name].time) this.dt[name].time = '08:00';
    this.syncDateTime(name);
  }

  onTime(name: 'start' | 'end', time: string) {
    this.dt[name].time = time;
    this.syncDateTime(name);
  }

  private syncDateTime(name: 'start' | 'end') {
    const { date, time } = this.dt[name];
    const control = this.settings.controls[name];
    const pad = (n: number) => String(n).padStart(2, '0');
    control.setValue(
      date && time
        ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`
        : '',
    );
    control.markAsTouched();
  }

  // ---- Question Bank ----
  get topics(): string[] {
    return [...new Set(this.bank.map((q) => q.topic))];
  }

  get filtered(): Question[] {
    const { search, topic, difficulty } = this.filters.value;
    const s = (search ?? '').toLowerCase();
    return this.bank.filter(
      (q) =>
        (!s || q.text.toLowerCase().includes(s)) &&
        (!topic || q.topic === topic) &&
        (!difficulty || q.difficulty === difficulty),
    );
  }

  get selectedTotal(): number {
    let sum = 0;
    this.selected.forEach((m) => (sum += m));
    return sum;
  }

  toggle(q: Question, checked: boolean) {
    checked ? this.selected.set(q.id, q.marks) : this.selected.delete(q.id);
  }

  setMarks(q: Question, value: string) {
    if (this.selected.has(q.id)) this.selected.set(q.id, +value || 0);
  }

  generateWithAi() {
    // TODO: call your AI endpoint with topic + difficulty, then push results into this.bank
    this.message = 'AI generation is not connected yet.';
  }

  // ---- Wizard ----
  stepValid(i: number): boolean {
    switch (i) {
      case 0: return this.basic.valid;
      case 1: return this.settings.valid;
      case 2:
        this.questionError =
          this.selectedTotal !== this.settings.value.totalMarks || this.selectedTotal === 0
            ? `Selected marks (${this.selectedTotal}) must equal total marks (${this.settings.value.totalMarks}).`
            : '';
        return !this.questionError;
      default: return true;
    }
  }

  private touch(i: number) {
    [this.basic, this.settings][i]?.markAllAsTouched();
  }

  next() {
    if (this.stepValid(this.step)) this.step++;
    else this.touch(this.step);
  }

  back() { if (this.step > 0) this.step--; }

  goTo(target: number) {
    if (target <= this.step) { this.step = target; return; }
    for (let i = this.step; i < target; i++) {
      if (!this.stepValid(i)) { this.touch(i); this.step = i; return; }
    }
    this.step = target;
  }

  // Top "Add Assessment" button: start a blank assessment.
  newAssessment() {
    this.form.reset();
    this.filters.reset();
    this.dt = {
      start: { date: null, time: '' },
      end: { date: null, time: '' },
    };
    this.selected.clear();
    this.bank = [];
    this.questionError = '';
    this.message = '';
    this.step = 0;
  }

  // ---- Save ----

  // 'YYYY-MM-DDTHH:mm' (browser local time) -> UTC ISO string, e.g. '2026-11-02T21:00:00.000Z'
  private toUtcIso(v: string): string | null {
    return v ? new Date(v).toISOString() : null;
  }

  save(status: 'draft' | 'published') {
    // Draft only needs a title; publish needs steps 1 to 3 to be valid.
    if (status === 'draft' && this.basic.controls.title.invalid) {
      this.step = 0; this.touch(0); return;
    }
    if (status === 'published') {
      for (let i = 0; i < 3; i++) {
        if (!this.stepValid(i)) { this.step = i; this.touch(i); return; }
      }
    }

    const v = this.form.getRawValue();
    const payload = {
      status,
      basic: v.basic,
      settings: {
        ...v.settings,
        start: this.toUtcIso(v.settings.start),
        end: this.toUtcIso(v.settings.end),
      },
      questions: [...this.selected].map(([questionId, marks]) => ({ questionId, marks })),
    };

    this.saving = true;
    this.http.post<{ id: number }>(`${this.api}/assessments`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.message = status === 'draft' ? 'Draft saved.' : 'Published. Assigned students can now see it.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.message = 'Could not save. Check your connection and try again.';
        this.cdr.markForCheck();
      },
    });
  }
}