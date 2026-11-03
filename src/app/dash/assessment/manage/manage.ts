import { Component, OnInit, AfterViewInit, ViewChild, HostListener, inject, ChangeDetectorRef } from '@angular/core';
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
  status: 'draft' | 'published';
  course: string;
  duration: number;
  totalMarks: number;
  deadline: Date | null;
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
export class Manage implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-4ipf.onrender.com';
  endPoint = 'assessments'; // no trailing slash, matches the Django router

  displayedColumns: string[] = ['id', 'title', 'type', 'course', 'duration', 'totalMarks', 'deadline', 'numberOfQuestions', 'status'];
  dataSource = new MatTableDataSource<Assessment>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedAssessment: Assessment | null = null;
  error = '';
  success = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadAssessments();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  async loadAssessments() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}`);
      if (response.ok) {
        const rows: any[] = await response.json();
        // Map the API fields to the table fields.
        this.dataSource.data = rows.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          status: r.status,
          course: r.course_name,
          duration: r.duration,
          totalMarks: r.total_marks,
          deadline: r.end ? new Date(r.end) : null,
          numberOfQuestions: r.question_count,
        }));
      } else {
        this.error = 'Could not load assessments';
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

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageSizeChange(size: number) {
    this.selectedPageSize = size;
    this.paginator.pageSize = size;
    this.paginator._changePageSize(size);
  }

  // Click anywhere outside a table row, the Update/Delete bar or a popup -> hide the buttons.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.selectedAssessment) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('tr.clickable, .selection-bar, .cdk-overlay-container')) return;
    this.selectedAssessment = null;
  }

  selectRow(a: Assessment) {
    this.selectedAssessment = this.selectedAssessment?.id === a.id ? null : a;
    this.success = '';
  }

  isSelected(a: Assessment): boolean {
    return this.selectedAssessment?.id === a.id;
  }

  openEditDialog(a: Assessment, event: Event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditAssessmentDialog, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      data: a, // the whole row, so the popup can fill itself straight away
    });

    dialogRef.afterClosed().subscribe(async (updated: boolean | undefined) => {
      if (updated) {
        this.success = 'Assessment updated successfully';
        await this.loadAssessments();
      }
      this.selectedAssessment = null;
      this.cdr.markForCheck();
    });
  }

  async deleteAssessment(a: Assessment, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${a.title}"?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}/${a.id}`, { method: 'DELETE' });

      if (response.ok) {
        this.success = 'Assessment deleted successfully';
        this.selectedAssessment = null;
        await this.loadAssessments();
      } else {
        this.error = 'Could not delete assessment';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }
}