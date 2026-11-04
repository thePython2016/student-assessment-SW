import { Component, OnInit, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  department_name: string;
  credits: number;
  first_name: string;
  last_name: string;
  description: string;
}

@Component({
  selector: 'app-view',
  imports: [
    RouterLink,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
  ],
  styleUrl: './view.css',
  templateUrl: './view.html',
})
export class View implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';
  endPoint = 'course';

  displayedColumns: string[] = [
    'id', 'course_name', 'course_code', 'department', 'credits', 'instructor',
  ];
  dataSource = new MatTableDataSource<Course>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;
  error = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadCourses();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  async loadCourses() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`);
      if (response.ok) {
        this.dataSource.data = await response.json();
      } else {
        const body = await response.json().catch(() => null);
        this.error = typeof body?.detail === 'string' ? body.detail : 'Failed to load courses';
      }
    } catch {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  onPageSizeChange(size: number) {
    this.selectedPageSize = size;
    this.paginator._changePageSize(size);
  }

  onPage(event: PageEvent) {
    this.selectedPageSize = event.pageSize;
  }
}