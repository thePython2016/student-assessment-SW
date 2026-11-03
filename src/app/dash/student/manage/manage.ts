import { Component, OnInit, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StudentEditDialog } from './student-edit-dialog';

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string | null;
  gender: string;
  course: string;
}

@Component({
  selector: 'app-manage',
  imports: [
    FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule,
  ],
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  base = 'https://student-assessment-4ipf.onrender.com';
  endPoint = 'students';

  displayedColumns = ['id', 'first_name', 'last_name', 'email', 'phone', 'gender', 'course'];
  dataSource = new MatTableDataSource<Student>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedStudent: Student | null = null;
  error = '';
  success = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadStudents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadStudents() {
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`);
      if (response.ok) {
        this.dataSource.data = await response.json();
      } else {
        this.error = 'Could not load students';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  onPageSizeChange(size: number) {
    this.selectedPageSize = size;
    if (this.paginator) {
      this.paginator.pageSize = size;
      this.paginator.firstPage();
    }
  }

  selectRow(row: Student) {
    this.selectedStudent = this.isSelected(row) ? null : row;
  }

  isSelected(row: Student) {
    return this.selectedStudent?.id === row.id;
  }

  // ---------- UPDATE: opens the modal ----------
  openEdit() {
    if (!this.selectedStudent) return;
    this.error = '';
    this.success = '';

    const ref = this.dialog.open(StudentEditDialog, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
      data: { id: this.selectedStudent.id },
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.success = 'Student updated successfully';
        this.selectedStudent = null;
        this.loadStudents();
      }
    });
  }

  // ---------- DELETE ----------
  async deleteStudent() {
    if (!this.selectedStudent) return;
    const s = this.selectedStudent;
    if (!confirm(`Delete ${s.first_name} ${s.last_name}?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${s.id}/`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        this.success = 'Student deleted successfully';
        this.selectedStudent = null;
        await this.loadStudents();
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