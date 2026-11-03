import { Component, OnInit, OnDestroy, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface StudentOption { id: number; name: string; username: string; email: string; department: string; course: string; }

interface HistoryRow {
  date: string; assessment: string; course: string;
  score: number | null; classAvg: number | null;
  status: 'Passed' | 'Failed' | 'Missed' | 'Pending';
}

interface PerformanceData {
  student: { name: string; department: string; course: string };
  summary: {
    avgScore: number; classAvg: number; rank: string | number; classSize: string | number;
    attempted: number; missed: number; probability: number; risk: 'Low' | 'Medium' | 'High';
  };
  history: { label: string; score: number; classAvg: number }[];
  topics: { topic: string; score: number }[];
  recommendations: string[];
}

@Component({
  selector: 'app-student-performance',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatDividerModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatTableModule, MatSortModule, MatPaginatorModule,
  ],
  templateUrl: './student-performance.html',
  styleUrl: './student-performance.css',
})
export class StudentPerformance implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private api = 'https://student-assessment-alis.onrender.com';
  private PASS_PERCENT = 50;   // used only if the API sends no pass_marks
  private sub = new Subscription();

  searchCtrl = new FormControl<string | StudentOption>('');
  students: StudentOption[] = [];
  searching = false;
  selectedId: number | null = null;

  data: PerformanceData | null = null;
  loading = false;
  error = '';

  displayedColumns = ['date', 'assessment', 'course', 'score', 'classAvg', 'status'];
  pageSizeOptions = [5, 10, 25];
  dataSource = new MatTableDataSource<HistoryRow>([]);

  // The history card is inside @if (data), so sort and paginator only exist after a student loads.
  // Setters attach them the moment Angular creates them.
  @ViewChild(MatSort) set sort(s: MatSort | undefined) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set paginator(p: MatPaginator | undefined) { if (p) this.dataSource.paginator = p; }

  // chart + topic helpers used by the template
  studentLine = '';
  classLine = '';
  xLabels: string[] = [];
  strengths: { topic: string; score: number }[] = [];
  weaknesses: { topic: string; score: number }[] = [];

  ngOnInit(): void {
    // Live search: waits 300 ms after typing, cancels older requests.
    this.sub.add(
      this.searchCtrl.valueChanges.pipe(
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => { this.searching = true; }),
        switchMap((q) => this.searchStudents(q)),
      ).subscribe((list) => {
        this.students = list;
        this.searching = false;
        this.cdr.markForCheck();
      }),
    );
    // First list shown when the field is focused.
    this.sub.add(this.searchStudents('').subscribe((l) => { this.students = l; this.cdr.markForCheck(); }));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  displayStudent = (s: StudentOption | string | null): string => (s && typeof s !== 'string' ? s.name : '');

  // ---- Auth (same as the dashboard) ----
  private getToken(): string | null {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    return raw ? raw.replace(/^"|"$/g, '') : null;
  }
  private authHeaders(): HttpHeaders {
    const t = this.getToken();
    return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : new HttpHeaders();
  }
  private explain(err: HttpErrorResponse, what: string): string {
    return err.status === 401 ? 'Your session has expired. Please log in again.'
      : err.status === 403 ? 'You do not have permission to view this.'
      : err.status === 404 ? `The endpoint for ${what} was not found.`
      : err.status === 0 ? 'Cannot reach the server.'
      : `Could not load ${what} (status ${err.status}).`;
  }

  // ---- Search ----
  private searchStudents(q: string) {
    return this.http.get<any>(`${this.api}/students`, { headers: this.authHeaders(), params: { search: q } }).pipe(
      map((body) => (Array.isArray(body) ? body : body?.results ?? []) as any[]),
      map((rows) => rows.map((r): StudentOption => ({
        id: r.id, name: r.name ?? r.full_name ?? r.username ?? r.email, username: r.username ?? '', email: r.email ?? '',
        department: r.department ?? '', course: r.course ?? r.course_name ?? '',
      }))),
      catchError((err: HttpErrorResponse) => {
        this.error = this.explain(err, 'students');
        return of([] as StudentOption[]);
      }),
    );
  }

  // Enter key or Search button: pick the exact email/username match, or the only result.
  onEnter(): void {
    const v = this.searchCtrl.value;
    if (v && typeof v !== 'string') { this.onStudentChange(v); return; }
    const q = (v ?? '').trim().toLowerCase();
    if (!q) return;
    this.searchStudents(q).subscribe((list) => {
      this.students = list;
      const exact = list.find((s) => s.email.toLowerCase() === q || s.username.toLowerCase() === q);
      const pick = exact ?? (list.length === 1 ? list[0] : null);
      if (pick) {
        this.searchCtrl.setValue(pick, { emitEvent: false });
        this.onStudentChange(pick);
      } else {
        this.data = null;
        this.error = list.length ? 'Several students match. Pick one from the list.' : 'No student found with that email or username.';
      }
      this.cdr.markForCheck();
    });
  }

  // ---- Load one student's performance ----
  onStudentChange(student: StudentOption): void {
    this.selectedId = student.id;
    this.error = '';
    this.loading = true;

    this.http.get<any>(`${this.api}/exam/results/student/${student.id}`, { headers: this.authHeaders() })
      .pipe(
        map((body) => (Array.isArray(body) ? body : body?.results ?? []) as any[]),
        catchError((err: HttpErrorResponse) => {
          this.error = this.explain(err, 'performance');
          return of(null);
        }),
      )
      .subscribe((rows) => {
        this.loading = false;
        if (rows) {
          this.data = this.build(student, rows);
          this.dataSource.data = this.toHistory(rows);
          this.buildCharts();
        } else {
          this.data = null;
        }
        this.cdr.markForCheck();
      });
  }

  // ---- Math (same rules as the dashboard) ----
  private percent(r: any): number { return r.total_marks ? Math.round((Number(r.score) / r.total_marks) * 100) : 0; }
  private passed(r: any): boolean {
    return r.pass_marks != null ? Number(r.score) >= Number(r.pass_marks) : this.percent(r) >= this.PASS_PERCENT;
  }
  private avg(v: number[]): number { return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; }
  private isMarked(r: any): boolean { return !!r.released && r.score !== null && r.score !== undefined; }
  private isMissed(r: any): boolean { return !r.submitted_at; }

  level(score: number): string { return score >= 70 ? 'good' : score >= 50 ? 'mid' : 'bad'; }

  private toDate(v: string | null): Date {
    if (!v) return new Date(0);
    return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(v) ? v : v + 'Z');
  }

  private build(student: StudentOption, rows: any[]): PerformanceData {
    const marked = rows.filter((r) => this.isMarked(r))
      .sort((a, b) => +this.toDate(a.submitted_at) - +this.toDate(b.submitted_at));
    const missed = rows.filter((r) => this.isMissed(r)).length;
    const attempted = rows.filter((r) => !this.isMissed(r)).length;

    const avgScore = this.avg(marked.map((r) => this.percent(r)));
    const classVals = marked.map((r) => r.class_avg).filter((v) => v != null).map(Number);
    const classAvg = this.avg(classVals);

    // Topics: average per topic (falls back to course name)
    const groups = new Map<string, number[]>();
    for (const r of marked) {
      const k = r.topic ?? r.course_name ?? r.course ?? 'Other';
      groups.set(k, [...(groups.get(k) ?? []), this.percent(r)]);
    }
    const topics = [...groups].map(([topic, v]) => ({ topic, score: this.avg(v) })).sort((a, b) => b.score - a.score);

    // Fail risk: simple estimate from fail rate, missed exams and low average.
    // Replace with your ML prediction endpoint if you have one.
    const failRate = marked.length ? marked.filter((r) => !this.passed(r)).length / marked.length : 0;
    const missRate = rows.length ? missed / rows.length : 0;
    const probability = Math.min(100, Math.round(
      failRate * 60 + missRate * 30 + Math.max(0, this.PASS_PERCENT + 20 - avgScore) * 0.5));
    const risk: 'Low' | 'Medium' | 'High' = probability >= 60 ? 'High' : probability >= 30 ? 'Medium' : 'Low';

    const recommendations: string[] = [];
    topics.filter((t) => t.score < 50).forEach((t) =>
      recommendations.push(`Revise ${t.topic}: the average there is ${t.score}%.`));
    if (missed > 0) recommendations.push(`Follow up on ${missed} missed assessment${missed > 1 ? 's' : ''}.`);
    if (classAvg && avgScore < classAvg) recommendations.push('Score is below the class average; consider extra practice sessions.');
    if (!recommendations.length) recommendations.push('Doing well. Keep the current study routine.');

    return {
      student: { name: student.name, department: student.department, course: student.course },
      summary: {
        avgScore, classAvg,
        rank: rows.find((r) => r.class_rank != null)?.class_rank ?? '—',
        classSize: rows.find((r) => r.class_size != null)?.class_size ?? '—',
        attempted, missed, probability, risk,
      },
      history: marked.map((r) => ({
        label: this.toDate(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: this.percent(r), classAvg: Number(r.class_avg ?? classAvg),
      })),
      topics, recommendations,
    };
  }

  private toHistory(rows: any[]): HistoryRow[] {
    return rows.map((r) => ({
      date: r.submitted_at
        ? this.toDate(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      assessment: r.title,
      course: r.course_name ?? r.course ?? '',
      score: this.isMarked(r) ? this.percent(r) : null,
      classAvg: r.class_avg ?? null,
      status: this.isMissed(r) ? 'Missed' : !this.isMarked(r) ? 'Pending' : this.passed(r) ? 'Passed' : 'Failed',
    }));
  }

  // ---- Charts (SVG viewBox -10..310 x, -10..115 y; y = 100 - score) ----
  private buildCharts(): void {
    const h = this.data?.history ?? [];
    const step = h.length > 1 ? 300 / (h.length - 1) : 0;
    const pts = (key: 'score' | 'classAvg') =>
      h.map((p, i) => `${Math.round(i * step)},${100 - (p[key] || 0)}`).join(' ');
    this.studentLine = pts('score');
    this.classLine = pts('classAvg');
    this.xLabels = h.map((p) => p.label);
    this.strengths = (this.data?.topics ?? []).filter((t) => t.score >= 70).slice(0, 3);
    this.weaknesses = (this.data?.topics ?? []).filter((t) => t.score < 50).slice(-3);
  }

  // ---- Export ----
  exportCsv(): void {
    if (!this.data) return;
    const head = ['Date', 'Assessment', 'Course', 'Score', 'Class Average', 'Status'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [head, ...this.dataSource.filteredData.map((r) => [
      r.date, r.assessment, r.course,
      r.score === null ? '' : r.score + '%',
      r.classAvg === null ? '' : r.classAvg + '%',
      r.status,
    ])].map((row) => row.map(esc).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.data.student.name.replace(/\s+/g, '_')}_performance.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}