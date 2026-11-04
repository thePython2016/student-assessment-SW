// Place at: src/app/studentcomponent/exam/exam-result/exam-result.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ExamResultData } from '../exam-result.model';

@Component({
  imports: [MatButtonModule],
  selector: 'app-exam-result',
  styleUrl: './exam-result.css',
  templateUrl: './exam-result.html',
})
export class ExamResult implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  base = 'https://student-assessment-4ipf.onrender.com';
  // shown instantly after submit; fetched from the server on refresh or from history
  result = signal<ExamResultData | null>(history.state?.result ?? null);
  error = signal('');

  async ngOnInit() {
    if (this.result()) return;
    const id = this.route.snapshot.paramMap.get('id');
    try {
      const res = await fetch(`${this.base}/submissions/${id}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      this.result.set(await res.json());
    } catch {
      this.error.set('Could not load the result');
    }
  }

  time(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m} min ${s} s` : `${s} s`;
  }

  back() {
    this.router.navigate(['/student-course/student/available-exam']);
  }
}