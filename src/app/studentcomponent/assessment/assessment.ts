import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface StatCard {
  label: string;
  value: string;
  danger?: boolean;
}

interface ResultRow {
  id: number;
  title: string;
  date: string;                       // display text
  scoreText: string;                  // "38 / 50 (76%)" or "Not released yet"
  note: string;                       // e.g. "Auto-submitted"
  status: 'Passed' | 'Failed' | 'Pending';
}

@Component({
  imports: [MatButtonModule, MatIconModule, MatTableModule],
  selector: 'app-assessment',
  styleUrl: './assessment.css',
  templateUrl: './assessment.html',
})
export class Assessment implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private api = 'https://student-assessment-alis.onrender.com';
  private PASS_PERCENT = 50;   // used only if the API sends no pass_marks
  private tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  resultColumns = ['title', 'date', 'score', 'status'];

  stats: StatCard[] = [];
  results: ResultRow[] = [];

  loading = false;
  error = '';

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
        this.results = rows.map((r) => this.toRow(r));
        this.buildStats(rows);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.results = [];
        this.stats = [];
        this.error =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 403 ? 'Only student accounts can view exam results.'
          : err.status === 404 ? 'Results endpoint not found. Check the URL.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not load your results (status ${err.status}).`;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private percent(r: any): number {
    return r.total_marks ? Math.round((Number(r.score) / r.total_marks) * 100) : 0;
  }

  private passed(r: any): boolean {
    return r.pass_marks != null
      ? Number(r.score) >= Number(r.pass_marks)
      : this.percent(r) >= this.PASS_PERCENT;
  }

  private toRow(r: any): ResultRow {
    const released = r.released && r.score !== null;
    return {
      id: r.id,
      title: r.title,
      date: this.formatDate(r.submitted_at),
      scoreText: released
        ? `${r.score} / ${r.total_marks} (${this.percent(r)}%)`
        : 'Not released yet',
      note: r.auto_submitted ? 'Auto-submitted' : '',
      status: !released ? 'Pending' : this.passed(r) ? 'Passed' : 'Failed',
    };
  }

  private buildStats(rows: any[]) {
    const released = rows.filter((r) => r.released && r.score !== null);
    const avg = released.length
      ? Math.round(released.reduce((s, r) => s + this.percent(r), 0) / released.length) + '%'
      : '—';

    this.stats = [
      { label: 'Completed', value: String(rows.length) },
      { label: 'Average score', value: avg },
      { label: 'Passed', value: String(released.filter((r) => this.passed(r)).length) },
      { label: 'Failed', value: String(released.filter((r) => !this.passed(r)).length), danger: true },
    ];
  }

  // API dates are UTC. If an offset is missing, treat the value as UTC.
  private formatDate(value: string | null): string {
    if (!value) return '';
    const iso = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + 'Z';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZone: this.tz,
    }).format(new Date(iso));
  }

  statusClass(status: ResultRow['status']): string {
    switch (status) {
      case 'Passed': return 'status-passed';
      case 'Failed': return 'status-failed';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  }
}