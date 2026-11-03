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

// What GET exam/admin-overview returns
interface Overview {
  totals: {
    students: number | null;
    courses: number | null;
    assessments: number;
    submissions: number;
    average_score: number | null;
    pass_rate: number | null;
  };
  recent: {
    student: string;
    title: string;
    percent: number | null;
    passed: boolean | null;
    submitted_at: string;
    auto_submitted: boolean;
  }[];
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

  private api = 'https://student-assessment-4ipf.onrender.com';

  userEmail = sessionStorage.getItem('email');

  loading = false;
  error = '';

  kpis: Kpi[] = [];
  recentActivity: Activity[] = [];

  quickLinks: QuickLink[] = [
    { label: 'Add Student', icon: 'person_add', route: '/dash/student/add', color: '#198754' },
    { label: 'Add Course', icon: 'add_box', route: '/dash/course/add', color: '#2b6cb0' },
    { label: 'Create Assessment', icon: 'assignment_add', route: '/dash/assessment/create', color: '#f59e0b' },
    { label: 'View Prediction', icon: 'bar_chart', route: 'dash/student/general-analytics', color: '#8b5cf6' },
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
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  load() {
    this.loading = true;
    this.error = '';

    if (!this.getToken()) {
      this.error = 'You are not logged in. Please log in again.';
      this.loading = false;
      return;
    }

    // Administrators use their own endpoint. exam/results is for students only.
    this.http.get<Overview>(`${this.api}/exam/admin-overview`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.buildKpis(data.totals);
        this.buildActivity(data.recent);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.kpis = [];
        this.recentActivity = [];
        this.error =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 403 ? 'This account is not an administrator.'
          : err.status === 404 ? 'The admin overview endpoint was not found. Check the URL.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not load the dashboard (status ${err.status}).`;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildKpis(t: Overview['totals']) {
    const show = (v: number | null) => (v === null || v === undefined ? '—' : String(v));
    this.kpis = [
      { label: 'Students', value: show(t.students), icon: 'groups', color: '#198754' },
      { label: 'Courses', value: show(t.courses), icon: 'menu_book', color: '#2b6cb0' },
      { label: 'Published Assessments', value: show(t.assessments), icon: 'assignment', color: '#f59e0b' },
      { label: 'Average Score', value: t.average_score === null ? '—' : `${t.average_score}%`, icon: 'insights', color: '#8b5cf6' },
    ];
  }

  private buildActivity(rows: Overview['recent']) {
    this.recentActivity = rows.map((r) => {
      const status: Status = r.passed === null ? 'Pending' : r.passed ? 'Passed' : 'Failed';
      const result =
        status === 'Pending' ? 'submitted, waiting to be marked'
        : `${status.toLowerCase()} with ${r.percent}%`;
      const auto = r.auto_submitted ? ' (auto-submitted)' : '';

      return {
        text: `${r.student} ${result}: "${r.title}"${auto}`,
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