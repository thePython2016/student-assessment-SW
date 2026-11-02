import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

interface Option { id: number; name: string; }

interface HistoryRow {
  date: string;              // e.g. "2026-03-14"
  assessment: string;
  course: string;
  score: number | null;      // percentage, null if missed
  classAvg: number;          // percentage
  status: 'Passed' | 'Failed' | 'Missed';
}

interface Topic { topic: string; score: number; }

interface PerformanceData {
  student: { id: number; name: string; course: string; department: string };
  summary: {
    avgScore: number; classAvg: number; rank: number; classSize: number;
    attempted: number; missed: number; risk: 'Low' | 'Medium' | 'High'; probability: number;
  };
  history: HistoryRow[];
  topics: Topic[];
  recommendations: string[];
}

@Component({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
  ],
  selector: 'app-student-performance',
  styleUrl: './student-performance.css',
  templateUrl: './student-performance.html',
})
export class StudentPerformance implements OnInit {
  private http = inject(HttpClient);
  private api = '/api'; // change to your backend URL

  // The table sits inside an @if, so these are set when it appears.
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }
  @ViewChild(MatSort) set sort(s: MatSort) { if (s) this.dataSource.sort = s; }

  students: Option[] = [];
  selectedId: number | null = null;
  data: PerformanceData | null = null;

  displayedColumns: string[] = ['date', 'assessment', 'course', 'score', 'classAvg', 'status'];
  dataSource = new MatTableDataSource<HistoryRow>([]);
  pageSizeOptions = [5, 10, 25];

  loading = false;
  error = '';
  usingSample = false;

  ngOnInit() {
    // Same students as your Student List. Change the names after "x." to match your fields.
    this.http.get<any[]>(`${this.api}/student`).subscribe({
      next: (list) => (this.students = list.map((x) => ({ id: x.id, name: `${x.firstName} ${x.lastName}` }))),
      error: () => {
        this.usingSample = true;
        this.students = [
          { id: 1, name: 'Salum Hassan' }, { id: 2, name: 'Amina Juma' }, { id: 3, name: 'Rehema Ali' },
        ];
      },
    });
  }

  onStudentChange(id: number) {
    this.loading = true;
    this.error = '';
    this.http.get<PerformanceData>(`${this.api}/student-performance/${id}`).subscribe({
      next: (d) => this.show(d),
      error: () => {
        this.usingSample = true;
        this.show(this.sample(id));
      },
    });
  }

  private show(d: PerformanceData) {
    this.data = d;
    this.dataSource.data = d.history;
    this.loading = false;
  }

  // ---- Chart helpers ----
  private points(values: (number | null)[]): string {
    const pts = values
      .map((v, i) => ({ v, i }))
      .filter((p) => p.v !== null) as { v: number; i: number }[];
    if (values.length < 2 || !pts.length) return '';
    const step = 300 / (values.length - 1);
    return pts.map((p) => `${(p.i * step).toFixed(1)},${(100 - p.v).toFixed(1)}`).join(' ');
  }

  private get ordered(): HistoryRow[] {
    return [...(this.data?.history ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  }

  get studentLine(): string { return this.points(this.ordered.map((h) => h.score)); }
  get classLine(): string { return this.points(this.ordered.map((h) => h.classAvg)); }
  get xLabels(): string[] { return this.ordered.map((h) => h.date.slice(5)); }

  level(score: number): 'strong' | 'ok' | 'weak' {
    return score >= 70 ? 'strong' : score >= 50 ? 'ok' : 'weak';
  }

  get strengths(): Topic[] { return (this.data?.topics ?? []).filter((t) => t.score >= 70); }
  get weaknesses(): Topic[] { return (this.data?.topics ?? []).filter((t) => t.score < 50); }

  exportCsv() {
    if (!this.data) return;
    const rows = [['Date', 'Assessment', 'Course', 'Score %', 'Class average %', 'Status']];
    this.data.history.forEach((h) =>
      rows.push([h.date, h.assessment, h.course, h.score === null ? '' : String(h.score), String(h.classAvg), h.status]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.data.student.name.replace(/\s+/g, '-').toLowerCase()}-performance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Shown only until your student-performance API is connected.
  private sample(id: number): PerformanceData {
    const name = this.students.find((s) => s.id === id)?.name ?? 'Student';
    return {
      student: { id, name, course: 'Database Systems', department: 'Computer Science' },
      summary: { avgScore: 52, classAvg: 65, rank: 38, classSize: 48, attempted: 6, missed: 2, risk: 'Medium', probability: 58 },
      history: [
        { date: '2026-02-10', assessment: 'Quiz 1', course: 'Database Systems', score: 68, classAvg: 63, status: 'Passed' },
        { date: '2026-02-24', assessment: 'Quiz 2', course: 'Database Systems', score: 61, classAvg: 66, status: 'Passed' },
        { date: '2026-03-10', assessment: 'Midterm', course: 'Database Systems', score: 48, classAvg: 62, status: 'Failed' },
        { date: '2026-03-24', assessment: 'Quiz 3', course: 'Database Systems', score: null, classAvg: 67, status: 'Missed' },
        { date: '2026-04-07', assessment: 'Quiz 4', course: 'Database Systems', score: 44, classAvg: 65, status: 'Failed' },
        { date: '2026-04-21', assessment: 'Assignment 1', course: 'Database Systems', score: null, classAvg: 70, status: 'Missed' },
        { date: '2026-05-05', assessment: 'Quiz 5', course: 'Database Systems', score: 39, classAvg: 64, status: 'Failed' },
      ],
      topics: [
        { topic: 'SQL basics', score: 78 }, { topic: 'Keys and constraints', score: 71 },
        { topic: 'Joins', score: 55 }, { topic: 'Normalization', score: 36 },
        { topic: 'Transactions', score: 32 }, { topic: 'Indexing', score: 49 },
      ],
      recommendations: [
        'Practise Normalization and Transactions, the two weakest topics.',
        'Scores have fallen over the last four assessments, so arrange a check-in.',
        'Two assessments were missed. Send a reminder about deadlines.',
      ],
    };
  }
}