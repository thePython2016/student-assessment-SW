import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
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
import { DepartmentEditDialog } from './department-edit-dialog';

interface Department {
  id: number;
  department_code: string;
  department_name: string;
  description: string;
}

@Component({
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  selector: 'app-manage',
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);

  base = 'https://student-assessment-4ipf.onrender.com';
  endPoint = 'department';

  displayedColumns: string[] = ['id', 'department_code', 'department_name', 'description'];
  dataSource = new MatTableDataSource<Department>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 10;

  selectedDepartment: Department | null = null;

  error = '';
  success = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadDepartments() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`);
      if (response.ok) {
        this.dataSource.data = await response.json();
      } else {
        this.error = 'Could not load departments';
      }
    } catch (e) {
      this.error = 'Server error occurred';
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

  selectRow(row: Department) {
    this.selectedDepartment = this.isSelected(row) ? null : row;
    this.success = '';
  }

  isSelected(row: Department): boolean {
    return this.selectedDepartment?.id === row.id;
  }

openEdit() {
  if (!this.selectedDepartment) return;

  const dialogRef = this.dialog.open(DepartmentEditDialog, {
    width: '520px',
    disableClose: true,
    data: { id: this.selectedDepartment.id },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.success = 'Department updated successfully';
      this.selectedDepartment = result;
      this.loadDepartments();
    }
  });
}

  async deleteDepartment() {
    if (!this.selectedDepartment) return;
    if (!confirm(`Delete ${this.selectedDepartment.department_name}?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(
        `${this.base}/${this.endPoint}/${this.selectedDepartment.id}/`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        this.success = 'Department deleted successfully';
        this.selectedDepartment = null;
        await this.loadDepartments();
      } else {
        this.error = 'Could not delete department';
      }
    } catch (e) {
      this.error = 'Server error occurred';
    }
  }
}