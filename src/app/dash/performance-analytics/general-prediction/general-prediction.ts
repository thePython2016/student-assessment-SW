import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private api = '/api'; // change to your backend URL

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
  usingSample = false;

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

  load() {
    this.loading = true;
    this.error = '';
    this.selected = null;

    this.http.get<StudentRisk[]>(`${this.api}/prediction`).subscribe({
      next: (list) => { this.setData(list, false); },
      error: () => { this.setData(this.sample(), true); },
    });
  }

  private setData(list: StudentRisk[], sample: boolean) {
    this.students = list;
    this.usingSample = sample;
    this.departments = [...new Set(list.map((s) => s.department))].sort();
    this.courses = [...new Set(list.map((s) => s.course))].sort();
    this.dataSource.data = list;
    this.loading = false;
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

  // Shown only until your prediction API is connected.
  private sample(): StudentRisk[] {
    const mk = (id: number, name: string, department: string, course: string, avgScore: number, trend: number,
      attempted: number, missed: number, probability: number, reasons: string[], actions: string[]): StudentRisk => ({
      id, name, department, course, avgScore, trend, attempted, missed, probability,
      predicted: probability >= 50 ? 'Fail' : 'Pass',
      risk: probability >= 70 ? 'High' : probability >= 40 ? 'Medium' : 'Low',
      reasons, actions,
    });
    return [
      mk(1, 'Salum Hassan', 'Computer Science', 'Database Systems', 31, -12, 6, 3, 91,
        ['Average score is 31%', 'Scores dropped 12 points over the last 3 assessments', 'Missed 3 of 9 assessments', 'Weak in Normalization and SQL joins'],
        ['Arrange a meeting with the instructor', 'Assign practice quizzes on Normalization', 'Send a reminder about upcoming deadlines']),
      mk(2, 'Rehema Ali', 'Business', 'Accounting I', 39, -4, 7, 2, 78,
        ['Average score is 39%', 'Missed 2 assessments', 'Course pass rate is only 49%'],
        ['Offer extra revision sessions', 'Review the topics she scored lowest on']),
      mk(3, 'John Peter', 'Engineering', 'Data Structures', 52, -9, 8, 1, 58,
        ['Scores are falling (down 9 points)', 'Spends little time on each assessment'],
        ['Check in on workload', 'Recommend practice on trees and graphs']),
      mk(4, 'Baraka Mushi', 'Computer Science', 'Database Systems', 61, 3, 9, 0, 33,
        ['Average is close to the pass mark'], ['Encourage steady practice']),
      mk(5, 'Neema Paul', 'Business', 'Marketing Basics', 84, 6, 9, 0, 8, ['No risk factors found'], ['No action needed']),
      mk(6, 'Amina Juma', 'Computer Science', 'Data Structures', 93, 2, 9, 0, 4, ['No risk factors found'], ['No action needed']),
    ];
  }
}