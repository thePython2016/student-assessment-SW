import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  private api = 'https://student-assessment-4ipf.onrender.com  ';

  courses: Option[] = [];
  types = ['MCQ', 'True/False', 'Short answer'];
  levels = ['Easy', 'Medium', 'Hard'];
  answers = ['True', 'False'];
  saving = false;
  message = '';
  isError = false;

  model = {
    courseId: null as number | null,
    text: '',
    answer: '' as '' | 'True' | 'False',
    topic: '',
    type: 'MCQ',
    difficulty: 'Easy',
    marks: 1,
  };

  ngOnInit() {
    this.loadCourses();
  }

  private loadCourses() {
    this.http.get<any>(`${this.api}/course/`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res.results ?? []);
        this.courses = list.map((x: any) => ({
          id: x.id ?? x.course_id,
          name: x.course_name ?? x.name,
        }));
      },
      error: () => {
        this.isError = true;
        this.message = 'Could not load courses.';
      },
    });
  }

  goToQuestions() {
    this.router.navigate(['/questions']);
  }

  // Sends both `course` and `courseId`; DRF ignores whichever the serializer doesn't use.
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

  // addAnother = true  -> Save & New: stay on the form
  // addAnother = false -> Save Question: go to the questions list
  save(form: NgForm, addAnother = false) {
    if (this.saving) return;
    if (form.invalid) { form.control.markAllAsTouched(); return; }

    const payload = this.buildPayload();
    console.log('Sending to API:', payload);

    this.saving = true;
    this.message = '';

    // No trailing slash: the router uses trailing_slash=False.
    this.http.post(`${this.api}/question-bank`, payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        this.saving = false;
        this.isError = false;

        if (addAnother) {
          this.message = 'Question added. Enter the next one.';
          form.resetForm({ ...this.model, text: '', answer: '' });
        } else {
          this.goToQuestions();
        }
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.saving = false;
        this.isError = true;
        this.message = this.readError(err);
      },
    });
  }

  private readError(err: any): string {
    if (err.status === 0) return 'Cannot reach the server.';
    const body = err.error;
    if (body && typeof body === 'object') {
      return Object.entries(body)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
    }
    return `Could not save the question (${err.status}).`;
  }

  clear(form: NgForm) {
    form.resetForm({ courseId: null, text: '', answer: '', topic: '', type: 'MCQ', difficulty: 'Easy', marks: 1 });
    this.message = '';
  }
}