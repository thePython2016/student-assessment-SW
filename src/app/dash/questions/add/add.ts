import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private api = 'http://127.0.0.1:8000';

  courses: Option[] = [];
  types = ['MCQ', 'True/False', 'Short answer'];
  levels = ['Easy', 'Medium', 'Hard'];
  saving = false;
  message = '';
  isError = false;

  model = {
    courseId: null as number | null,
    text: '',
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

  save(form: NgForm) {
    if (form.invalid) { form.control.markAllAsTouched(); return; }

    this.saving = true;
    this.http.post(`${this.api}/question-bank`, this.model).subscribe({
      next: () => {
        this.saving = false;
        this.isError = false;
        this.message = 'Question added.';
        // Keep everything except the question text, so you can add the next one quickly.
        form.resetForm({ ...this.model, text: '' });
      },
      error: () => {
        this.saving = false;
        this.isError = true;
        this.message = 'Could not save the question. Try again.';
      },
    });
  }

  clear(form: NgForm) {
    form.resetForm({ courseId: null, text: '', topic: '', type: 'MCQ', difficulty: 'Easy', marks: 1 });
    this.message = '';
  }
}