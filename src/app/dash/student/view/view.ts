import { Component, AfterViewInit, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  gender: string;
}

@Component({
  selector: 'app-view',
  imports: [
    CommonModule, RouterLink, MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatCardModule, MatDividerModule, MatSelectModule, FormsModule,
  ],
  styleUrl: './view.css',
  templateUrl: './view.html',
})
export class View implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  base = 'https://student-assessment-alis.onrender.com';
  error = '';
  loading = false;

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'phone', 'course', 'gender'];
  dataSource = new MatTableDataSource<Student>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  students: Student[] = [];

  ngOnInit() {
    this.loadStudents();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  async loadStudents() {
    this.loading = true;
    this.error = '';
    try {
      const response = await fetch(`${this.base}/students/`);
      if (!response.ok) {
        this.error = 'Could not load students';
        return;
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results; // data.results if DRF pagination is on

      this.students = list.map((s: any): Student => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        phone: s.phone,
        course: s.course,
        gender: s.gender,
      }));
      this.dataSource.data = this.students;
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.loading = false;
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
    this.paginator.pageSize = size;
    this.paginator._changePageSize(size);
  }

  editStudent(student: Student) {
    this.router.navigate(['/dash/student/edit', student.id]); // adjust to your edit route
  }

  async deleteStudent(student: Student) {
    if (!confirm(`Delete ${student.firstName} ${student.lastName}?`)) return;

    try {
      const response = await fetch(`${this.base}/students/${student.id}/`, { method: 'DELETE' });
      if (response.status === 204) {
        this.students = this.students.filter(s => s.id !== student.id);
        this.dataSource.data = this.students;
      } else {
        this.error = 'Could not delete student';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }
}