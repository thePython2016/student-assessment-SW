// view.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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

interface Department {
  id: number;
  department_code: string;
  department_name: string;
  description: string;
}

@Component({
  selector: 'app-view',
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
  ],
  styleUrl: './view.css',
  templateUrl: './view.html',
})
export class View implements OnInit, AfterViewInit {
  base = 'https://student-assessment-4ipf.onrender.com';
  endPoint = 'department';

  displayedColumns: string[] = ['id', 'departmentCode', 'departmentName', 'description'];
  dataSource = new MatTableDataSource<Department>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 10;

  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

// variables
id='';
department_code='';
department_name='';
description=''



 
  
  async loadDepartments() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/`);
        if(response.ok){
      const results=await response.json()
      this.dataSource.data=results;

    }
      
      
      else {
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
}