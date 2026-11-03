import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

interface StudentRisk {
  id: number;
  name: string;
  department: string;
  course: string;
  avgScore: number;      // 0-100
  trend: number;         // change in score, e.g. +5 or -8
  attempted: number;
  missed: number;
  predicted: 'Pass' | 'Fail';
  probability: number;   // chance of failing, 0-100
  risk: 'Low' | 'Medium' | 'High';
  reasons: string[];
  actions: string[];
}

@Component({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
  ],
  selector: 'app-general-prediction',
  styleUrl: './general-prediction.css',
  templateUrl: './general-prediction.html',
})
export class GeneralPrediction implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private api = 'https://student-assessment-alis.onrender.com';   // same base as your other pages

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'name', 'department', 'course', 'avgScore', 'trend', 'missed', 'predicted', 'probability', 'risk',
  ];
  dataSource = new MatTableDataSource<StudentRisk>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 10;

  students: StudentRisk[] = [];
  departments: string[] = [];
  courses: string[] = [];
  selected: StudentRisk | null = null;

  loading = false;
  error = '';

  filters = { search: '', department: '', course: '', risk: '' };

  ngOnInit() {
    // Filter in the browser using all four filters together.
    this.dataSource.filterPredicate = (row, raw) => {
      const f = JSON.parse(raw) as typeof this.filters;
      const s = f.search.trim().toLowerCase();
      return (
        (!s || row.name.toLowerCase().includes(s) || row.course.toLowerCase().includes(s)) &&
        (!f.department || row.department === f.department) &&
        (!f.course || row.course === f.course) &&
        (!f.risk || row.risk === f.risk)
      );
    };
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ---- Auth (same as your other pages) ----
  private authHeaders(): HttpHeaders {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : null;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private explain(err: HttpErrorResponse): string {
    return err.status === 401 ? 'Your session has expired. Please log in again.'
      : err.status === 403 ? 'Only admins can view predictions.'
      : err.status === 404 ? 'The prediction endpoint was not found.'
      : err.status === 0 ? 'Cannot reach the server.'
      : `Could not load predictions (status ${err.status}).`;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.selected = null;

    this.http.get<any>(`${this.api}/exam/prediction`, { headers: this.authHeaders() }).subscribe({
      next: (body) => {
        this.setData((Array.isArray(body) ? body : body?.results ?? []) as StudentRisk[]);
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.explain(err);
        this.setData([]);
      },
    });
  }

  private setData(list: StudentRisk[]) {
    this.students = list;
    this.departments = [...new Set(list.map((s) => s.department).filter(Boolean))].sort();
    this.courses = [...new Set(list.map((s) => s.course).filter(Boolean))].sort();
    this.dataSource.data = list;
    this.loading = false;
    this.cdr.markForCheck();
  }

  // ---- Toolbar ----
  applyFilter(event: Event) {
    this.filters.search = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify(this.filters);
    this.dataSource.paginator?.firstPage();
  }

  onPageSizeChange(size: number) {
    this.paginator.pageSize = size;
    this.paginator.firstPage();
    this.dataSource.paginator = this.paginator;
  }

  count(level: 'Low' | 'Medium' | 'High'): number {
    return this.students.filter((s) => s.risk === level).length;
  }

  // ---- Details ----
  select(row: StudentRisk) { this.selected = row; }
  close() { this.selected = null; }

  exportCsv() {
    const rows = [['Name', 'Department', 'Course', 'Average', 'Trend', 'Missed', 'Predicted', 'Fail probability %', 'Risk']];
    this.dataSource.filteredData.forEach((s) =>
      rows.push([s.name, s.department, s.course, String(s.avgScore), String(s.trend), String(s.missed), s.predicted, String(s.probability), s.risk]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'at-risk-students.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}