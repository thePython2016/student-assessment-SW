// Place at: src/app/studentcomponent/exam/available-exam/available-exam.ts

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

type Status = 'Available' | 'In progress' | 'Upcoming' | 'Completed' | 'Missed' | 'Closed';
type Tab = 'All' | Status;

interface ExamItem {
  id: number;
  title: string;
  course: string;
  type: string;                 // Quiz, Midterm, Final...
  opensAt: string;              // ISO date-time (always with a Z or offset)
  closesAt: string;             // ISO date-time (always with a Z or offset)
  durationMin: number;
  questionCount: number;
  totalMarks: number;
  status: Status;
  score: number | null;
  resultsVisible: boolean;
}

@Component({
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  selector: 'app-available-exam',
  styleUrl: './available-exam.css',
  templateUrl: './available-exam.html',
})
export class AvailableExam implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';
  endPoint = 'assessments/available'; // no trailing slash, matches the Django router

  // Timezone used to display dates. Defaults to each student's own browser zone.
  // For one fixed zone for everyone, use: 'Africa/Dar_es_Salaam'
  tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  tabs: Tab[] = ['All', 'Available', 'Upcoming', 'Closed'];
  tab: Tab = 'All';
  search = '';

  all: ExamItem[] = [];
  view: ExamItem[] = [];        // what the page shows, rebuilt by refresh()

  loading = false;
  error = '';

  ngOnInit() {
    this.load();
  }

  // ---- Token ----
  private authHeaders(): Record<string, string> {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      // Give up after 8 seconds instead of waiting for the browser's long default.
      const response = await fetch(`${this.base}/${this.endPoint}`, {
        headers: this.authHeaders(),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const body = await response.json();
        const rows: any[] = Array.isArray(body) ? body : body.results ?? [];   // works with or without DRF pagination
        this.all = rows.map((r) => this.toExam(r));
      } else {
        this.error = response.status === 401
          ? 'Your session has expired. Please log in again.'
          : `Could not load exams (status ${response.status})`;
        this.all = [];
      }
    } catch (e: any) {
      this.error = e?.name === 'TimeoutError'
        ? 'The server did not answer within 8 seconds'
        : e instanceof SyntaxError
          ? 'The server did not return JSON. Check the URL'
          : 'Cannot reach the server';
      this.all = [];
    } finally {
      this.loading = false;
      this.refresh();
      this.cdr.markForCheck();
    }
  }

  // ---- Time helpers ----

  // If the API string has no Z or +hh:mm offset, treat it as UTC (Django stores UTC).
  private utc(value: string | null | undefined): string {
    if (!value) return '';
    return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + 'Z';
  }

  // Use in the template instead of the date pipe: {{ formatTime(e.opensAt) }}
  formatTime(value: string | null): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZone: this.tz,
    }).format(new Date(value));
  }

  // Turns the Django fields (StudentAssessmentSerializer) into what the page uses.
  private toExam(r: any): ExamItem {
    const opensAt = this.utc(r.start);
    const closesAt = this.utc(r.end);
    const opensLater = opensAt ? Date.parse(opensAt) > Date.now() : false;
    const closed = closesAt ? Date.parse(closesAt) <= Date.now() : false;
    return {
      id: r.id,
      title: r.title,
      course: r.course_name || 'No course',
      type: r.type,
      opensAt,
      closesAt,
      durationMin: r.duration,
      questionCount: r.question_count,
      totalMarks: r.total_marks,
      status: closed ? 'Closed' : opensLater ? 'Upcoming' : 'Available',
      score: null,
      resultsVisible: true,
    };
  }

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.refresh();
  }

  refresh() {
    const s = this.search.trim().toLowerCase();
    const rank: Record<Status, number> = {
      'In progress': 0, Available: 1, Upcoming: 2, Completed: 3, Missed: 4, Closed: 5,
    };
    const when = (e: ExamItem) =>
      e.status === 'Upcoming' ? Date.parse(e.opensAt)
      : e.status === 'Completed' || e.status === 'Missed' || e.status === 'Closed' ? -Date.parse(e.closesAt)  // newest first
      : Date.parse(e.closesAt);                                                                              // closing soonest first

    this.view = this.all
      .filter((e) =>
        (this.tab === 'All' || e.status === this.tab) &&
        (!s || e.title.toLowerCase().includes(s) || e.course.toLowerCase().includes(s)))
      .sort((a, b) => rank[a.status] - rank[b.status] || when(a) - when(b));
  }

  count(t: Tab): number {
    return t === 'All' ? this.all.length : this.all.filter((e) => e.status === t).length;
  }

  // ---- Card helpers ----
  badge(s: Status): string { return s.replace(' ', '-').toLowerCase(); }

  icon(type: string): string {
    const icons: Record<string, string> = {
      Quiz: 'quiz', Midterm: 'description', Final: 'school', Assignment: 'edit_note', Practice: 'fitness_center',
    };
    return icons[type] ?? 'quiz';
  }

  timeLeft(e: ExamItem): string {
    const target = new Date(e.status === 'Upcoming' ? e.opensAt : e.closesAt).getTime();
    const mins = Math.round((target - Date.now()) / 60000);
    if (mins <= 0) return e.status === 'Upcoming' ? 'Opening now' : 'Closing now';
    const t = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} h` : `${Math.round(mins / 1440)} days`;
    return e.status === 'Upcoming' ? `Opens in ${t}` : `Closes in ${t}`;
  }

  scoreText(e: ExamItem): string {
    if (!e.resultsVisible) return 'Result not released yet';
    if (e.score === null) return 'Waiting for marking';
    return `${e.score} / ${e.totalMarks} (${Math.round((e.score / e.totalMarks) * 100)}%)`;
  }

  // Start button → attempt page
  start(e: ExamItem) {
    if (e.status !== 'Available' && e.status !== 'In progress') return;
    this.router.navigate(['/student-course/student/exam-attempt', e.id]);
  }
}