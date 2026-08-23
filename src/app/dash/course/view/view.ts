import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  department: string;
  duration: string;
  credits: number;
  instructor: string;
}

@Component({
  selector: 'app-view',
  imports: [
    CommonModule,
    RouterLink,
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
    FormsModule
  ],
  styleUrl: './view.css',
  templateUrl: './view.html',
})
export class View implements AfterViewInit {

  displayedColumns: string[] = ['id', 'courseName', 'courseCode', 'department', 'duration', 'credits', 'instructor'];
  dataSource: MatTableDataSource<Course>;

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  courses: Course[] = [
    { id: 1, courseName: 'Intro to Computer Science', courseCode: 'CS101', department: 'Computer Science', duration: '1 Year', credits: 4, instructor: 'Dr. Alan Kimaro' },
    { id: 2, courseName: 'Business Fundamentals', courseCode: 'BUS101', department: 'Business Administration', duration: '6 Months', credits: 3, instructor: 'Dr. Neema Mushi' },
    { id: 3, courseName: 'Structural Engineering', courseCode: 'ENG201', department: 'Engineering', duration: '2 Years', credits: 5, instructor: 'Eng. Peter Mrema' },
  ];

  constructor() {
    this.dataSource = new MatTableDataSource(this.courses);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageSizeChange(size: number) {
    this.selectedPageSize = size;
    this.paginator.pageSize = size;
    this.paginator._changePageSize(size);
  }
}