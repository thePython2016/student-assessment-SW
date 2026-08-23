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

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'phone', 'course', 'gender'];
  dataSource: MatTableDataSource<Student>;

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  students: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '0712345678', course: 'Computer Science', gender: 'Male' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '0723456789', course: 'Business Admin', gender: 'Female' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike.j@example.com', phone: '0734567890', course: 'Engineering', gender: 'Male' },
  ];

  constructor() {
    this.dataSource = new MatTableDataSource(this.students);
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

  editStudent(student: Student) {
    // navigate to edit page or open dialog
  }

  deleteStudent(student: Student) {
    this.students = this.students.filter(s => s.id !== student.id);
    this.dataSource.data = this.students;
  }
}