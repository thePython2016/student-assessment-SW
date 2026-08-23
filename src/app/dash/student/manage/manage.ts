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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { EditStudentDialog } from '../edit-student-dialog/edit-student-dialog';

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
  selector: 'app-manage',
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
    MatDialogModule,
    FormsModule
  ],
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements AfterViewInit {

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'phone', 'course', 'gender'];
  dataSource: MatTableDataSource<Student>;

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedStudent: Student | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  students: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '0712345678', course: 'Computer Science', gender: 'Male' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '0723456789', course: 'Business Admin', gender: 'Female' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike.j@example.com', phone: '0734567890', course: 'Engineering', gender: 'Male' },
  ];

  constructor(private dialog: MatDialog) {
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

  selectRow(student: Student) {
    this.selectedStudent = this.selectedStudent?.id === student.id ? null : student;
  }

  isSelected(student: Student): boolean {
    return this.selectedStudent?.id === student.id;
  }

  openEditDialog(student: Student, event: Event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditStudentDialog, {
      data: student
    });

    dialogRef.afterClosed().subscribe((updated: Student | undefined) => {
      if (updated) {
        const index = this.students.findIndex(s => s.id === updated.id);
        if (index > -1) {
          this.students[index] = updated;
          this.dataSource.data = [...this.students];
        }
      }
      this.selectedStudent = null;
    });
  }

  deleteStudent(student: Student, event: Event) {
    event.stopPropagation();
    this.students = this.students.filter(s => s.id !== student.id);
    this.dataSource.data = this.students;
    this.selectedStudent = null;
  }
}