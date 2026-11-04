// Place at: src/app/studentcomponent/exam/exam-attempt/exam-attempt.ts

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ExamInfo } from '../exam-result.model';

@Component({
  imports: [MatButtonModule],
  selector: 'app-exam-attempt',
  styleUrl: './exam-attempt.css',
  templateUrl: './exam-attempt.html',
})
export class ExamAttempt implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  base = 'https://student-assessment-4ipf.onrender.com';
  examId = Number(this.route.snapshot.paramMap.get('id'));

  info = signal<ExamInfo | null>(null);
  answers = signal<Record<number, string>>({});   // questionId -> 'True' | 'False'
  secondsLeft = signal(0);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  answeredCount = computed(() => Object.keys(this.answers()).length);

  timeText = computed(() => {
    const s = Math.max(0, this.secondsLeft());
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  });

  private timer?: ReturnType<typeof setInterval>;
  private autoSubmitted = false;

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  // ---- Token ----
  private headers(json = false): Record<string, string> {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : '';
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ---- Load: starts the attempt on the first call, resumes it on later calls ----
  private async load() {
    try {
      const res = await fetch(`${this.base}/exam/${this.examId}/start`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        this.error.set(await this.message(res, 'Could not load the exam'));
        return;
      }

      const data = await res.json();
      // The API sends auto_submit; the rest of this page uses autoSubmit.
      const info = { ...data, autoSubmit: data.auto_submit ?? data.autoSubmit } as ExamInfo;
      this.info.set(info);

      // Restore answers after a refresh, but only for the same attempt.
      if (data.resumed) {
        const saved = localStorage.getItem(this.answerKey());
        if (saved) this.answers.set(JSON.parse(saved));
      } else {
        localStorage.removeItem(this.answerKey());
      }

      this.startTimer(Number(data.limit_seconds), info);
    } catch {
      this.error.set('Cannot reach the server');
    } finally {
      this.loading.set(false);
    }
  }

  // Remaining time comes from the server, so a refresh cannot reset the clock.
  private startTimer(limitSeconds: number, info: ExamInfo) {
    const deadline = Date.now() + limitSeconds * 1000;
    const tick = () => {
      const left = Math.round((deadline - Date.now()) / 1000);
      this.secondsLeft.set(left);
      if (left <= 0 && info.autoSubmit && !this.autoSubmitted) {
        this.autoSubmitted = true;
        this.submit(true);
      }
    };
    tick();
    this.timer = setInterval(tick, 1000);
  }

  setAnswer(questionId: number, answer: string) {
    this.answers.update((a) => ({ ...a, [questionId]: answer }));
    localStorage.setItem(this.answerKey(), JSON.stringify(this.answers()));
  }

  async submit(auto = false) {
    if (this.submitting()) return;

    const missing = (this.info()?.questions.length ?? 0) - this.answeredCount();
    if (!auto && missing > 0 && !confirm(`You have ${missing} unanswered question(s). Submit anyway?`)) return;

    this.submitting.set(true);
    this.error.set('');

    try {
      const res = await fetch(`${this.base}/exam/${this.examId}/submit`, {
        method: 'POST',
        headers: this.headers(true),
        // answers: { "<questionId>": "True" | "False" }
        body: JSON.stringify({ answers: this.answers(), autoSubmitted: auto }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        this.error.set(await this.message(res, 'Could not submit. Your answers are saved, try again.'));
        return;
      }

      localStorage.removeItem(this.answerKey());
      clearInterval(this.timer);

      // The submit reply is only { message }, so read the saved result.
      let result: any = { id: this.examId };
      try {
        const r = await fetch(`${this.base}/exam/${this.examId}/result`, { headers: this.headers() });
        if (r.ok) result = { id: this.examId, ...(await r.json()) };
      } catch { /* the result page can still load without it */ }

      this.router.navigate(['/student-course/student/exam-result', this.examId], { state: { result } });
    } catch {
      // answers stay in localStorage, so the student can retry
      this.error.set('Could not reach the server. Your answers are saved, try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  back() {
    this.router.navigate(['/student-course/student/available-exam']);
  }

  private async message(res: Response, fallback: string): Promise<string> {
    if (res.status === 401) return 'Your session has expired. Please log in again.';
    try {
      const body = await res.json();
      return body?.detail ?? fallback;
    } catch {
      return fallback;
    }
  }

  private answerKey() { return `exam-answers-${this.examId}`; }
}