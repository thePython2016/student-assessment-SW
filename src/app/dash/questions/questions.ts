import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

export type QuestionType = 'mcq' | 'true-false' | 'short-answer';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface StagedQuestion {
  questionText: string;
  type: QuestionType;
  marks: number;
  options?: QuestionOption[];
  trueFalseAnswer?: boolean;
  shortAnswer?: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatTableModule,
  ],
  selector: 'app-questions',
  styleUrl: './questions.css',
  templateUrl: './questions.html',
})
export class Questions implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  assessmentId: string | null = null;

  questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True / False' },
    { value: 'short-answer', label: 'Short Answer' },
  ];

  // form fields
  questionText = '';
  type: QuestionType = 'mcq';
  marks = 1;
  options: QuestionOption[] = [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ];
  trueFalseAnswer = true;
  shortAnswer = '';

  editingIndex: number | null = null;

  stagedQuestions: StagedQuestion[] = [];
  displayedColumns: string[] = ['index', 'questionText', 'type', 'marks', 'actions'];

  submitting = false;

  ngOnInit(): void {
    this.assessmentId = this.route.snapshot.paramMap.get('assessmentId');
  }

  onTypeChange(): void {
    if (this.type === 'mcq' && this.options.length === 0) {
      this.options = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    }
  }

  addOption(): void {
    this.options.push({ text: '', isCorrect: false });
  }

  removeOption(index: number): void {
    if (this.options.length <= 2) {
      this.snackBar.open('A multiple choice question needs at least 2 options', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.options.splice(index, 1);
  }

  markCorrectOption(index: number): void {
    this.options.forEach((opt, i) => (opt.isCorrect = i === index));
  }

  private validate(): boolean {
    if (!this.questionText.trim()) {
      this.snackBar.open('Question text is required', 'Close', { duration: 3000 });
      return false;
    }
    if (!this.marks || this.marks < 1) {
      this.snackBar.open('Marks must be at least 1', 'Close', { duration: 3000 });
      return false;
    }
    if (this.type === 'mcq') {
      if (this.options.some((o) => !o.text.trim())) {
        this.snackBar.open('All options need text', 'Close', { duration: 3000 });
        return false;
      }
      if (!this.options.some((o) => o.isCorrect)) {
        this.snackBar.open('Mark one option as the correct answer', 'Close', { duration: 3000 });
        return false;
      }
    }
    if (this.type === 'short-answer' && !this.shortAnswer.trim()) {
      this.snackBar.open('Provide the expected short answer', 'Close', { duration: 3000 });
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    const question: StagedQuestion = {
      questionText: this.questionText,
      type: this.type,
      marks: this.marks,
      ...(this.type === 'mcq' && { options: this.options.map((o) => ({ ...o })) }),
      ...(this.type === 'true-false' && { trueFalseAnswer: this.trueFalseAnswer }),
      ...(this.type === 'short-answer' && { shortAnswer: this.shortAnswer }),
    };

    if (this.editingIndex !== null) {
      this.stagedQuestions[this.editingIndex] = question;
      this.editingIndex = null;
    } else {
      this.stagedQuestions = [...this.stagedQuestions, question];
    }

    this.resetForm();
  }

  onCancel(): void {
    if (this.editingIndex !== null) {
      this.editingIndex = null;
      this.resetForm();
      return;
    }
    this.router.navigate(['/dash/assessment']);
  }

  editQuestion(index: number): void {
    const q = this.stagedQuestions[index];
    this.editingIndex = index;

    this.questionText = q.questionText;
    this.type = q.type;
    this.marks = q.marks;
    this.trueFalseAnswer = q.trueFalseAnswer ?? true;
    this.shortAnswer = q.shortAnswer ?? '';
    this.options = q.options
      ? q.options.map((o) => ({ ...o }))
      : [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ];
  }

  deleteQuestion(index: number): void {
    this.stagedQuestions = this.stagedQuestions.filter((_, i) => i !== index);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.questionText = '';
    this.type = 'mcq';
    this.marks = 1;
    this.trueFalseAnswer = true;
    this.shortAnswer = '';
    this.options = [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ];
  }

  saveAllQuestions(): void {
    if (!this.assessmentId) {
      this.snackBar.open('Missing assessment ID in route', 'Close', { duration: 3000 });
      return;
    }
    if (this.stagedQuestions.length === 0) {
      this.snackBar.open('Add at least one question first', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    this.http
      .post(`/api/assessments/${this.assessmentId}/questions`, {
        questions: this.stagedQuestions,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.snackBar.open('Questions saved successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dash/assessment']);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          this.snackBar.open('Failed to save questions', 'Close', { duration: 3000 });
        },
      });
  }
}