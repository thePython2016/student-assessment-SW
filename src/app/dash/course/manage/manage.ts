import { Component, OnInit, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseEditDialog } from './course-edit-dialog';

export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  department: string;
  credits: number;
  instructor: string;
  description: string;
}

@Component({
  selector: 'app-manage',
  imports: [
    RouterLink, FormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatCardModule, MatDividerModule, MatSelectModule, MatDialogModule,
  ],
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-alis.onrender.com';
  endPoint = 'course';

  displayedColumns: string[] = [
    'id', 'course_name', 'course_code', 'department', 'credits', 'instructor',
  ];
  dataSource = new MatTableDataSource<Course>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedCourse: Course | null = null;
  error = '';
  success = '';

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
        this.error = 'Could not load courses';
      }
    } catch (e) {
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
    this.paginator.pageSize = size;
    this.paginator.firstPage();
    this.dataSource.paginator = this.paginator;
  }

  selectRow(course: Course) {
    this.selectedCourse = this.selectedCourse?.id === course.id ? null : course;
    this.success = '';
  }

  isSelected(course: Course): boolean {
    return this.selectedCourse?.id === course.id;
  }

  openEdit() {
    if (!this.selectedCourse) return;

    const dialogRef = this.dialog.open(CourseEditDialog, {
      width: '560px',
      disableClose: true,
      data: { id: this.selectedCourse.id },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.success = 'Course updated successfully';
        this.selectedCourse = null;
        await this.loadCourses();
      }
    });
  }

  async deleteCourse() {
    if (!this.selectedCourse) return;
    if (!confirm(`Delete ${this.selectedCourse.course_name}?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(
        `${this.base}/${this.endPoint}/${this.selectedCourse.id}/`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        this.success = 'Course deleted successfully';
        this.selectedCourse = null;
        await this.loadCourses();
      } else {
        this.error = 'Could not delete course';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }
}