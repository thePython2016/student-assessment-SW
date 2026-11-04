import { Component, AfterViewInit, OnDestroy, OnInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Chart from 'chart.js/auto';

// Where the exam page lives in your student routes. Change it to match.
const EXAM_ROUTE = '/student/examination';

type Range = 'week' | 'month' | 'year';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  bg: string;
  fg: string;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  color: string;
}

interface UpcomingAssessment {
  id: number;
  title: string;
  dueLabel: string;
  durationMinutes: number;
  available: boolean;
}

interface RecentResult {
  title: string;
  date: string;          // display text
  scoreText: string;     // "38 / 50 (76%)" or "Not released yet"
  status: 'Excellent' | 'Good' | 'At risk' | 'Pending';
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  styleUrl: './student-dashboard.css',
  templateUrl: './student-dashboard.html',
})
export class StudentDashboard implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private api = 'https://student-assessment-4ipf.onrender.com';
  private PASS_PERCENT = 50;   // used only if the API sends no pass_marks
  private tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  currentDate = new Date();
  searchQuery = '';
  email = this.readEmail();      // from session storage
  name = this.readName();        // shown in the banner
  studentName = this.name;       // first letter shown in the avatar

  range: Range = 'week';
  loading = false;
  error = '';

  stats: StatCard[] = this.buildStats([], []);
  subjectBreakdown: SubjectPerformance[] = [];
  upcomingAssessments: UpcomingAssessment[] = [];
  recentResults: RecentResult[] = [];

  private released: any[] = [];                 // marked results the student may see
  private trendLabels: string[] = [];
  private trendValues: (number | null)[] = [];

  ngOnInit(): void {
    this.load();
  }

  // ---- Token (same as your Assessment page) ----
  private getToken(): string | null {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    return raw ? raw.replace(/^"|"$/g, '') : null;
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // The data inside the login token (works when the token is a JWT).
  private tokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;   // not a JWT
    }
  }

  // Email saved at login. Looks in session storage first, then local storage, then the token.
  // If your login saves it under another key, add that key to one of the two lists below.
  private readEmail(): string {
    for (const store of [sessionStorage, localStorage]) {
      for (const key of ['email', 'userEmail', 'user_email', 'loginEmail']) {
        const value = store.getItem(key);
        if (value) return value.replace(/^"|"$/g, '');
      }
      for (const key of ['user', 'currentUser', 'loginUser', 'userData']) {
        try {
          const email = JSON.parse(store.getItem(key) ?? 'null')?.email;   // email inside a saved user object
          if (email) return email;
        } catch { /* not JSON */ }
      }
    }
    return this.tokenPayload()?.email ?? '';
  }

  // Name for the banner: a saved name, then the token's name, then a name made from the email.
  private readName(): string {
    const saved = sessionStorage.getItem('studentName') ?? localStorage.getItem('studentName');
    if (saved) return saved.replace(/^"|"$/g, '');

    const payload = this.tokenPayload();
    const fromToken = payload?.name ?? payload?.first_name ?? payload?.username;
    if (fromToken) return fromToken;

    if (this.email) {
      // "peter.mushi22@school.com" becomes "Peter Mushi"
      const fromEmail = this.email.split('@')[0]
        .replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (fromEmail) return fromEmail;
    }
    return 'Student';
  }

  // ---- Load ----
  load(): void {
    this.error = '';
    if (!this.getToken()) {
      this.error = 'You are not logged in. Please log in again.';
      return;
    }

    this.loading = true;
    const problems: string[] = [];

    // Each request reports its own problem, so one failing does not hide the other.
    const get = (path: string, what: string) =>
      this.http.get<any>(`${this.api}/${path}`, { headers: this.authHeaders() }).pipe(
        map((body) => (Array.isArray(body) ? body : body?.results ?? []) as any[]),
        catchError((err: HttpErrorResponse) => {
          problems.push(this.explain(err, what));
          return of([] as any[]);
        }),
      );

    forkJoin({ results: get('exam/results', 'your results'), open: get('assessments/available', 'upcoming exams') })
      .subscribe(({ results, open }) => {
        this.apply(results, open);
        this.error = problems.join(' ');
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private explain(err: HttpErrorResponse, what: string): string {
    return err.status === 401 ? 'Your session has expired. Please log in again.'
      : err.status === 403 ? 'Only student accounts can view this.'
      : err.status === 404 ? `The endpoint for ${what} was not found.`
      : err.status === 0 ? 'Cannot reach the server.'
      : `Could not load ${what} (status ${err.status}).`;
  }

  // ---- Turn API rows into what the page shows ----
  private apply(results: any[], open: any[]): void {
    this.released = results.filter((r) => r.released && r.score !== null && r.score !== undefined);

    // Upcoming: still open or opening soon, and not already taken (when the results say which exam they are)
    const taken = new Set(results.map((r) => r.assessment_id).filter((id) => id != null));
    const now = Date.now();
    const upcoming = open
      .filter((a) => !taken.has(a.id) && (!a.end || Date.parse(a.end) > now))
      .sort((a, b) => Date.parse(a.end ?? '') - Date.parse(b.end ?? ''))
      .slice(0, 5);

    this.upcomingAssessments = upcoming.map((a) => {
      const available = !a.start || Date.parse(a.start) <= now;
      return {
        id: a.id,
        title: a.title,
        dueLabel: available ? this.dueLabel(a.end) : `Opens ${this.shortDate(a.start)}`,
        durationMinutes: a.duration,
        available,
      };
    });

    this.stats = this.buildStats(results, upcoming);
    this.buildSubjects();
    this.buildTrend();

    this.recentResults = [...results]
      .sort((a, b) => this.toDate(b.submitted_at).getTime() - this.toDate(a.submitted_at).getTime())
      .slice(0, 5)
      .map((r) => this.toRecent(r));
  }

  private percent(r: any): number {
    return r.total_marks ? Math.round((Number(r.score) / r.total_marks) * 100) : 0;
  }

  private passed(r: any): boolean {
    return r.pass_marks != null ? Number(r.score) >= Number(r.pass_marks) : this.percent(r) >= this.PASS_PERCENT;
  }

  private avg(values: number[]): number | null {
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  }

  private buildStats(results: any[], upcoming: any[]): StatCard[] {
    const marked = results.filter((r) => r.released && r.score !== null && r.score !== undefined);
    const average = this.avg(marked.map((r) => this.percent(r)));
    const passRate = marked.length ? Math.round((marked.filter((r) => this.passed(r)).length / marked.length) * 100) : null;
    const pct = (v: number | null) => (v === null ? '—' : `${v}%`);

    return [
      { label: 'Exams Taken', value: String(results.length), icon: 'description', bg: '#e6f4ea', fg: '#2e7d32' },
      { label: 'Open Exams', value: String(upcoming.length), icon: 'event_available', bg: '#e8f0fe', fg: '#1a56db' },
      { label: 'Pass Rate', value: pct(passRate), icon: 'check_circle', bg: '#111827', fg: '#ffffff' },
      { label: 'Overall Score', value: pct(average), icon: 'emoji_events', bg: '#fff8e1', fg: '#f9a825' },
    ];
  }

  // Subject-wise strength: average score per course. Needs course_name in each result row.
  private buildSubjects(): void {
    const groups = new Map<string, number[]>();
    for (const r of this.released) {
      const name = r.course_name ?? r.course ?? 'Other';
      groups.set(name, [...(groups.get(name) ?? []), this.percent(r)]);
    }
    this.subjectBreakdown = [...groups]
      .map(([subject, values]) => {
        const score = this.avg(values) ?? 0;
        return { subject, score, color: score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444' };
      })
      .sort((a, b) => b.score - a.score);
  }

  private toRecent(r: any): RecentResult {
    const marked = r.released && r.score !== null && r.score !== undefined;
    const p = marked ? this.percent(r) : 0;
    return {
      title: r.title,
      date: this.formatDate(r.submitted_at),
      scoreText: marked ? `${r.score} / ${r.total_marks} (${p}%)` : 'Not released yet',
      status: !marked ? 'Pending' : !this.passed(r) ? 'At risk' : p >= 80 ? 'Excellent' : 'Good',
    };
  }

  // ---- Trend (Week / Month / Year) ----
  setRange(r: Range): void {
    if (r === this.range) return;
    this.range = r;
    this.buildTrend();
  }

  private buildTrend(): void {
    const DAY = 86400000;
    const today = this.startOfDay(new Date());
    const pts = this.released.map((r) => ({ day: this.startOfDay(this.toDate(r.submitted_at)), p: this.percent(r) }));

    if (this.range === 'year') {
      const months = Array.from({ length: 12 }, (_, i) => new Date(today.getFullYear(), today.getMonth() - 11 + i, 1));
      this.trendLabels = months.map((m) => m.toLocaleString('en-US', { month: 'short' }));
      this.trendValues = months.map((m) => this.avg(
        pts.filter((x) => x.day.getFullYear() === m.getFullYear() && x.day.getMonth() === m.getMonth()).map((x) => x.p)));
    } else if (this.range === 'month') {
      const spans = [0, 1, 2, 3].map((i) => {
        const end = today.getTime() - (3 - i) * 7 * DAY;
        return [end - 6 * DAY, end];
      });
      this.trendLabels = spans.map((_, i) => `Week ${i + 1}`);
      this.trendValues = spans.map(([lo, hi]) => this.avg(
        pts.filter((x) => x.day.getTime() >= lo && x.day.getTime() <= hi).map((x) => x.p)));
    } else {
      const days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() - (6 - i) * DAY));
      this.trendLabels = days.map((d) => d.toLocaleString('en-US', { weekday: 'short' }));
      this.trendValues = days.map((d) => this.avg(pts.filter((x) => x.day.getTime() === d.getTime()).map((x) => x.p)));
    }
    this.updateChart();
  }

  // ---- Dates. API dates are UTC; if the offset is missing, treat the value as UTC. ----
  private toDate(value: string | null): Date {
    if (!value) return new Date(0);
    return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + 'Z');
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private formatDate(value: string | null): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: this.tz,
    }).format(this.toDate(value));
  }

  private dueLabel(end: string | null): string {
    if (!end) return 'No deadline';
    const days = Math.round((this.startOfDay(this.toDate(end)).getTime() - this.startOfDay(new Date()).getTime()) / 86400000);
    return days <= 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
  }

  private shortDate(iso: string | null): string {
    return iso ? this.toDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  }

  // ---- Actions ----
  start(a: UpcomingAssessment): void {
    if (a.available) this.router.navigate([EXAM_ROUTE, a.id]);
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  statusClass(status: string): string {
    if (status === 'Excellent') return 'status excellent';
    if (status === 'Good') return 'status good';
    if (status === 'Pending') return 'status pending';
    return 'status risk';
  }

  // ---- Chart ----
  ngAfterViewInit(): void {
    this.chart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.trendLabels,
        datasets: [
          {
            data: this.trendValues,
            borderColor: '#111827',
            backgroundColor: 'rgba(17,24,39,0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#111827',
            spanGaps: true,   // days or weeks without an exam are joined, not shown as zero
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { font: { size: 11 } }, grid: { color: '#f3f4f6' } },
          x: { ticks: { font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.trendLabels;
    this.chart.data.datasets[0].data = this.trendValues;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}