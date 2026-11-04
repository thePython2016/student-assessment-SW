import { Component, OnInit, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InstructorEditDialog } from './instructor-edit-dialog';

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department: number;
  department_name: string;
}

@Component({
  selector: 'app-manage',
  imports: [
    FormsModule, RouterLink, MatCardModule, MatDividerModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule,
  ],
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com  ';
  endPoint = 'instructor';

  displayedColumns: string[] = [
    'id', 'first_name', 'last_name', 'email', 'phone', 'department_name',
  ];
  dataSource = new MatTableDataSource<Instructor>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 10;

  selectedInstructor: Instructor | null = null;
  error = '';
  success = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadInstructors();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadInstructors() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`);
      if (response.ok) {
        this.dataSource.data = await response.json();
      } else {
        this.error = 'Could not load instructors';
      }
    } catch (e) {
      this.error = 'Server error occurred';
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
    this.paginator.pageSize = size;
    this.paginator.firstPage();
    this.dataSource.paginator = this.paginator;
  }

  selectRow(row: Instructor) {
    this.selectedInstructor = this.isSelected(row) ? null : row;
    this.success = '';
  }

  isSelected(row: Instructor): boolean {
    return this.selectedInstructor?.id === row.id;
  }

  openEdit() {
    if (!this.selectedInstructor) return;

    const dialogRef = this.dialog.open(InstructorEditDialog, {
      width: '560px',
      disableClose: true,
      data: { id: this.selectedInstructor.id },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.success = 'Instructor updated successfully';
        this.selectedInstructor = null;
        await this.loadInstructors();
      }
    });
  }

  async deleteInstructor() {
    if (!this.selectedInstructor) return;
    const name = `${this.selectedInstructor.first_name} ${this.selectedInstructor.last_name}`;
    if (!confirm(`Delete ${name}?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(
        `${this.base}/${this.endPoint}/${this.selectedInstructor.id}/`,
        { method: 'DELETE' }
      );

      if (response.status === 204 || response.ok) {
        this.success = 'Instructor deleted successfully';
        this.selectedInstructor = null;
        await this.loadInstructors();
      } else {
        this.error = 'Could not delete instructor';
      }
    } catch (e) {
      this.error = 'Server error occurred';
    } finally {
      this.cdr.markForCheck();
    }
  }
}