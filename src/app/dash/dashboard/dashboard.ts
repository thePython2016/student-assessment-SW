import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

interface Kpi {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface QuickLink {
  label: string;
  icon: string;
  route: string;
  color: string;
}

type Status = 'Passed' | 'Failed' | 'Pending';

interface Activity {
  text: string;
  time: string;
  icon: string;
  status: Status;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  // Same backend and endpoint as the Assessment page
  private api = 'https://student-assessment-4ipf.onrender.com';
  private PASS_PERCENT = 50;   // used only if the API sends no pass_marks

  userEmail = sessionStorage.getItem('email');

  loading = false;
  error = '';

  kpis: Kpi[] = [];
  recentActivity: Activity[] = [];

  quickLinks: QuickLink[] = [
    { label: 'Add Student', icon: 'person_add', route: '/dash/student/add', color: '#198754' },
    { label: 'Add Course', icon: 'add_box', route: '/dash/course/add', color: '#2b6cb0' },
    { label: 'Create Assessment', icon: 'assignment_add', route: '/dash/assessment/create', color: '#f59e0b' },
    { label: 'View Analytics', icon: 'bar_chart', route: '/dash/analytics', color: '#8b5cf6' },
  ];

  ngOnInit() {
    this.load();
  }

  // ---- Token ----
  private getToken(): string | null {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    return raw ? raw.replace(/^"|"$/g, '') : null;   // strips quotes if it was saved with JSON.stringify
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  load() {
    this.loading = true;
    this.error = '';

    if (!this.getToken()) {
      this.error = 'You are not logged in. Please log in again.';
      this.loading = false;
      return;
    }

    this.http.get<any>(`${this.api}/exam/results`, { headers: this.authHeaders() }).subscribe({
      next: (body) => {
        const rows: any[] = Array.isArray(body) ? body : body.results ?? [];
        this.buildKpis(rows);
        this.buildActivity(rows);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.kpis = [];
        this.recentActivity = [];
        this.error =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 403 ? 'This account is not allowed to view exam results.'
          : err.status === 404 ? 'Results endpoint not found. Check the URL.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not load the dashboard (status ${err.status}).`;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ---- Same scoring logic as the Assessment page ----
  private percent(r: any): number {
    return r.total_marks ? Math.round((Number(r.score) / r.total_marks) * 100) : 0;
  }

  private passed(r: any): boolean {
    return r.pass_marks != null
      ? Number(r.score) >= Number(r.pass_marks)
      : this.percent(r) >= this.PASS_PERCENT;
  }

  private isReleased(r: any): boolean {
    return !!r.released && r.score !== null;
  }

  private statusOf(r: any): Status {
    return !this.isReleased(r) ? 'Pending' : this.passed(r) ? 'Passed' : 'Failed';
  }

  private buildKpis(rows: any[]) {
    const released = rows.filter((r) => this.isReleased(r));
    const avg = released.length
      ? Math.round(released.reduce((s, r) => s + this.percent(r), 0) / released.length) + '%'
      : '—';

    this.kpis = [
      { label: 'Completed', value: String(rows.length), icon: 'task_alt', color: '#2b6cb0' },
      { label: 'Average Score', value: avg, icon: 'insights', color: '#f59e0b' },
      { label: 'Passed', value: String(released.filter((r) => this.passed(r)).length), icon: 'check_circle', color: '#198754' },
      { label: 'Failed', value: String(released.filter((r) => !this.passed(r)).length), icon: 'cancel', color: '#dc2626' },
    ];
  }

  private buildActivity(rows: any[]) {
    this.recentActivity = [...rows]
      .sort((a, b) => this.toTime(b.submitted_at) - this.toTime(a.submitted_at))
      .slice(0, 5)
      .map((r) => {
        const status = this.statusOf(r);
        const result =
          status === 'Pending' ? 'result not released yet'
          : `${status.toLowerCase()} with ${this.percent(r)}%`;
        const auto = r.auto_submitted ? ' (auto-submitted)' : '';

        return {
          text: `"${r.title}" ${result}${auto}`,
          time: this.timeAgo(r.submitted_at),
          icon: status === 'Passed' ? 'check_circle' : status === 'Failed' ? 'cancel' : 'hourglass_empty',
          status,
        };
      });
  }

  // API dates are UTC. If an offset is missing, treat the value as UTC.
  private toTime(value: string | null): number {
    if (!value) return 0;
    const iso = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + 'Z';
    return new Date(iso).getTime();
  }

  private timeAgo(value: string | null): string {
    if (!value) return '';
    const diff = Math.floor((Date.now() - this.toTime(value)) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)} days ago`;
  }
}