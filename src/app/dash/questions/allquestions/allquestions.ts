import { Component, OnInit, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuestionEditDialog } from './question-edit-dialog';

export interface Question {
  id: number;
  courseId: number;
  course_name: string;
  text: string;
  topic: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

@Component({
  selector: 'app-allquestions',
  imports: [
    RouterLink, FormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatCardModule, MatDividerModule, MatSelectModule, MatDialogModule,
  ],
  styleUrl: './allquestions.css',
  templateUrl: './allquestions.html',
})
export class Allquestions implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  base = 'https://student-assessment-alis.onrender.com';
  endPoint = 'question-bank'; // no trailing slash, matches the Django router

  displayedColumns: string[] = ['id', 'text', 'course_name', 'topic', 'type', 'difficulty', 'marks'];
  dataSource = new MatTableDataSource<Question>([]);

  pageSizeOptions = [5, 10, 25, 50];
  selectedPageSize = 5;

  selectedQuestion: Question | null = null;
  error = '';
  success = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadQuestions();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  async loadQuestions() {
    this.error = '';
    try {
      const response = await fetch(`${this.base}/${this.endPoint}`);
      if (response.ok) {
        this.dataSource.data = await response.json();
      } else {
        this.error = 'Could not load questions';
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
    this.dataSource.paginator?.firstPage();
  }

  onPageSizeChange(size: number) {
    this.selectedPageSize = size;
    this.paginator.pageSize = size;
    this.paginator.firstPage();
    this.dataSource.paginator = this.paginator;
  }

  selectRow(question: Question) {
    this.selectedQuestion = this.selectedQuestion?.id === question.id ? null : question;
    this.success = '';
  }

  isSelected(question: Question): boolean {
    return this.selectedQuestion?.id === question.id;
  }

  openEdit() {
    if (!this.selectedQuestion) return;

    const dialogRef = this.dialog.open(QuestionEditDialog, {
      width: '640px',
      disableClose: true,
      data: { id: this.selectedQuestion.id },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.success = 'Question updated successfully';
        this.selectedQuestion = null;
        await this.loadQuestions();
      }
    });
  }

  async deleteQuestion() {
    if (!this.selectedQuestion) return;
    if (!confirm(`Delete question #${this.selectedQuestion.id}?`)) return;

    this.error = '';
    this.success = '';
    try {
      const response = await fetch(
        `${this.base}/${this.endPoint}/${this.selectedQuestion.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        this.success = 'Question deleted successfully';
        this.selectedQuestion = null;
        await this.loadQuestions();
      } else {
        this.error = 'Could not delete question';
      }
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.cdr.markForCheck();
    }
  }
}