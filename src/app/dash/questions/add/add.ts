import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize, timeout } from 'rxjs';

interface Option { id: number; name: string; }

@Component({
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  selector: 'app-add',
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = 'https://student-assessment-4ipf.onrender.com';

  courses = signal<Option[]>([]);
  types = ['MCQ', 'True/False', 'Short answer'];
  levels = ['Easy', 'Medium', 'Hard'];
  answers = ['True', 'False'];

  busy = signal(false);       // blocks double-clicks only; label never changes
  message = signal('');
  isError = signal(false);

  private msgTimer?: ReturnType<typeof setTimeout>;

  model = this.emptyModel();

  private emptyModel() {
    return {
      courseId: null as number | null,
      text: '',
      answer: '' as '' | 'True' | 'False',
      topic: '',
      type: 'MCQ',
      difficulty: 'Easy',
      marks: 1,
    };
  }

  ngOnInit() {
    // Also wakes the Render server before the user submits.
    this.loadCourses();
  }

  private loadCourses() {
    this.http.get<any>(`${this.api}/api/course/`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res.results ?? []);
        this.courses.set(list.map((x: any) => ({
          id: x.id ?? x.course_id,
          name: x.course_name ?? x.name,
        })));
      },
      error: () => this.show('Could not load courses. Please refresh the page.', true),
    });
  }

  goToQuestions() {
    this.router.navigate(['/questions']);
  }

  private buildPayload() {
    return {
      course: this.model.courseId,
      courseId: this.model.courseId,
      text: this.model.text.trim(),
      answer: this.model.answer,
      topic: this.model.topic.trim(),
      type: this.model.type,
      difficulty: this.model.difficulty,
      marks: Number(this.model.marks),
    };
  }

  private show(text: string, error: boolean, hideAfterMs = error ? 6000 : 4000) {
    clearTimeout(this.msgTimer);
    this.isError.set(error);
    this.message.set(text);
    if (hideAfterMs) this.msgTimer = setTimeout(() => this.message.set(''), hideAfterMs);
  }

  // addAnother = true  -> Save & New: stay on the form
  // addAnother = false -> Submit: show message, then go to the questions list
  submit(form: NgForm, addAnother = false) {
    if (this.busy()) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.show('Please fill in all required fields.', true);
      return;
    }

    this.busy.set(true);
    this.message.set('');

    this.http.post(`${this.api}/api/question-bank`, this.buildPayload())
      .pipe(
        timeout(60000),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => {
          if (addAnother) {
            form.resetForm(this.emptyModel());
            this.show('Question submitted successfully. Enter the next one.', false);
          } else {
            this.show('Question submitted successfully.', false, 0);
            setTimeout(() => this.goToQuestions(), 1200);
          }
        },
        error: (err) => this.show(this.readError(err), true),
      });
  }

  private readError(err: any): string {
    if (err?.name === 'TimeoutError') return 'The server took too long to respond. Please try again.';
    if (err.status === 0) return 'Cannot reach the server. Check your connection and try again.';
    if (err.status === 404) return 'Submit endpoint not found (404). Check the API URL.';
    if (err.status >= 500) return 'Server error. Please try again in a moment.';
    const body = err.error;
    if (body && typeof body === 'object') {
      return Object.entries(body)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
    }
    return `Could not submit the question (${err.status}).`;
  }

  clear(form: NgForm) {
    form.resetForm(this.emptyModel());
    this.message.set('');
  }
}