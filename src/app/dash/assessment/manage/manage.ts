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
import { EditAssessmentDialog } from '../edit-assessment-dialog/edit-assessment-dialog';

export interface Assessment {
  id: number;
  title: string;
  type: string;
  course: string;
  duration: number;
  totalMarks: number;
  deadline: Date;
  numberOfQuestions: number;
}

@Component({
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
  selector: 'app-manage',
  styleUrl: './manage.css',
  templateUrl: './manage.html',
})
export class Manage implements AfterViewInit {

  displayedColumns: string[] = ['id', 'title', 'type', 'course', 'duration', 'totalMarks', 'deadline', 'numberOfQuestions'];
  dataSource: MatTableDataSource<Assessment>;

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedAssessment: Assessment | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  assessments: Assessment[] = [
    { id: 1, title: 'Midterm Quiz', type: 'Quiz', course: 'Computer Science', duration: 30, totalMarks: 20, deadline: new Date('2026-09-10'), numberOfQuestions: 10 },
    { id: 2, title: 'Final Exam', type: 'Exam', course: 'Business Administration', duration: 120, totalMarks: 100, deadline: new Date('2026-11-15'), numberOfQuestions: 50 },
    { id: 3, title: 'Structural Analysis Assignment', type: 'Assignment', course: 'Engineering', duration: 0, totalMarks: 30, deadline: new Date('2026-09-25'), numberOfQuestions: 5 },
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.assessments);
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

  selectRow(a: Assessment) {
    this.selectedAssessment = this.selectedAssessment?.id === a.id ? null : a;
  }

  isSelected(a: Assessment): boolean {
    return this.selectedAssessment?.id === a.id;
  }

  openEditDialog(a: Assessment, event: Event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditAssessmentDialog, {
      data: a
    });

    dialogRef.afterClosed().subscribe((updated: Assessment | undefined) => {
      if (updated) {
        const index = this.assessments.findIndex(x => x.id === updated.id);
        if (index > -1) {
          this.assessments[index] = updated;
          this.dataSource.data = [...this.assessments];
        }
      }
      this.selectedAssessment = null;
    });
  }

  deleteAssessment(a: Assessment, event: Event) {
    event.stopPropagation();
    this.assessments = this.assessments.filter(x => x.id !== a.id);
    this.dataSource.data = this.assessments;
    this.selectedAssessment = null;
  }
}