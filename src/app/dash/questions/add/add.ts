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
  private api = 'https://student-assessment-alis.onrender.com';

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
    this.http.get<any[]>(`${this.api}/course`).subscribe((c) =>
      (this.courses = c.map((x) => ({
        id: x.id ?? x.course_id,
        name: x.course_name ?? x.name,
      }))));
  }

  goToQuestions() {
    this.router.navigate(['/questions']);
  }

  // addAnother = true  -> Save & New: stay on the form for the next question
  // addAnother = false -> Save Question: go to the questions list
  save(form: NgForm, addAnother = false) {
    if (this.saving) return;
    if (form.invalid) { form.control.markAllAsTouched(); return; }

    this.saving = true;
    this.message = '';

    this.http.post(`${this.api}/question-bank`, this.model).subscribe({
      next: () => {
        this.saving = false;
        this.isError = false;

        if (addAnother) {
          this.message = 'Question added. Enter the next one.';
          // Keep course, topic, type, difficulty and marks; clear only the question and answer.
          form.resetForm({ ...this.model, text: '', answer: '' });
        } else {
          this.goToQuestions();
        }
      },
      error: () => {
        this.saving = false;
        this.isError = true;
        this.message = 'Could not save the question. Try again.';
      },
    });
  }

  clear(form: NgForm) {
    form.resetForm({ courseId: null, text: '', answer: '', topic: '', type: 'MCQ', difficulty: 'Easy', marks: 1 });
    this.message = '';
  }
}