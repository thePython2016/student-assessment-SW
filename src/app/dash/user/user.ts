import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const SAMPLE_USERS: AppUser[] = [
  { id: 1, name: 'Amina Hassan', email: 'amina.hassan@example.com', role: 'admin', createdAt: '2025-01-12' },
  { id: 2, name: 'John Mwakalinga', email: 'john.mwakalinga@example.com', role: 'teacher', createdAt: '2025-02-03' },
  { id: 3, name: 'Grace Kileo', email: 'grace.kileo@example.com', role: 'teacher', createdAt: '2025-02-14' },
  { id: 4, name: 'Peter Nyerere', email: 'peter.nyerere@example.com', role: 'student', createdAt: '2025-03-01' },
  { id: 5, name: 'Fatuma Said', email: 'fatuma.said@example.com', role: 'student', createdAt: '2025-03-05' },
  { id: 6, name: 'David Mushi', email: 'david.mushi@example.com', role: 'student', createdAt: '2025-03-10' },
  { id: 7, name: 'Neema Joseph', email: 'neema.joseph@example.com', role: 'student', createdAt: '2025-03-18' },
  { id: 8, name: 'Emmanuel Kessy', email: 'emmanuel.kessy@example.com', role: 'student', createdAt: '2025-04-02' },
  { id: 9, name: 'Halima Rajabu', email: 'halima.rajabu@example.com', role: 'student', createdAt: '2025-04-09' },
  { id: 10, name: 'Baraka Chuwa', email: 'baraka.chuwa@example.com', role: 'teacher', createdAt: '2025-04-20' },
  { id: 11, name: 'Rehema Salim', email: 'rehema.salim@example.com', role: 'student', createdAt: '2025-05-02' },
  { id: 12, name: 'Isaac Mbwana', email: 'isaac.mbwana@example.com', role: 'student', createdAt: '2025-05-15' },
];

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  selector: 'app-user',
  styleUrl: './user.css',
  templateUrl: './user.html',
})
export class User implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'createdAt'];
  dataSource = new MatTableDataSource<AppUser>([]);

  pageSizeOptions: number[] = [5, 10, 25, 50];
  selectedPageSize = 10;

  selectedUser: AppUser | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.http.get<AppUser[]>('/api/users').subscribe({
      next: (users) => {
        this.dataSource.data = users;
      },
      error: (err) => {
        console.warn('Falling back to sample users — API not available yet:', err);
        this.dataSource.data = SAMPLE_USERS;
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageSizeChange(size: number): void {
    this.selectedPageSize = size;
    this.dataSource.paginator!.pageSize = size;
    this.dataSource.paginator!.firstPage();
  }

  selectRow(row: AppUser): void {
    this.selectedUser = this.isSelected(row) ? null : row;
  }

  isSelected(row: AppUser): boolean {
    return this.selectedUser?.id === row.id;
  }

  openEditDialog(user: AppUser, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dash/users', user.id, 'edit']);
  }

  deleteUser(user: AppUser, event: Event): void {
    event.stopPropagation();

    this.http.delete(`/api/users/${user.id}`).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((u) => u.id !== user.id);
        if (this.selectedUser?.id === user.id) {
          this.selectedUser = null;
        }
        this.snackBar.open('User deleted', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
      },
    });
  }
}