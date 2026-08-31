import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

export type AssignmentStatus = 'not-submitted' | 'submitted' | 'graded' | 'overdue';

export interface StudentAssignment {
  id: string;
  title: string;
  courseName: string;
  subjectIcon: string;
  dueDate: string;
  maxPoints: number;
  status: AssignmentStatus;
  submittedDate?: string;
  grade?: number;
  feedback?: string;
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  providers: [DatePipe],
  selector: 'app-assignment',
  styleUrl: './assignment.css',
  templateUrl: './assignment.html',
})
export class Assignment {
  searchTerm = '';
  courseFilter = 'all';
  selectedTabIndex = 0;

  courses: string[] = [];
  allAssignments: StudentAssignment[] = [];

  readonly tabs: { label: string; status: AssignmentStatus | 'all' }[] = [
    { label: 'All', status: 'all' },
    { label: 'Not Submitted', status: 'not-submitted' },
    { label: 'Submitted', status: 'submitted' },
    { label: 'Graded', status: 'graded' },
    { label: 'Overdue', status: 'overdue' },
  ];

  constructor(private router: Router) {
    // TODO: replace mock data with a call to the FastAPI backend,
    // e.g. this.assignmentService.getStudentAssignments().subscribe(...)
    this.allAssignments = this.getMockAssignments();
    this.courses = Array.from(new Set(this.allAssignments.map(a => a.courseName)));
  }

  get filteredAssignments(): StudentAssignment[] {
    const activeStatus = this.tabs[this.selectedTabIndex].status;
    const term = this.searchTerm.trim().toLowerCase();

    return this.allAssignments.filter(a => {
      const matchesStatus = activeStatus === 'all' || a.status === activeStatus;
      const matchesCourse = this.courseFilter === 'all' || a.courseName === this.courseFilter;
      const matchesSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.courseName.toLowerCase().includes(term);
      return matchesStatus && matchesCourse && matchesSearch;
    });
  }

  statusLabel(status: AssignmentStatus): string {
    switch (status) {
      case 'not-submitted': return 'Not Submitted';
      case 'submitted': return 'Submitted';
      case 'graded': return 'Graded';
      case 'overdue': return 'Overdue';
    }
  }

  actionLabel(status: AssignmentStatus): string {
    switch (status) {
      case 'not-submitted': return 'Submit Work';
      case 'submitted': return 'View Submission';
      case 'graded': return 'View Feedback';
      case 'overdue': return 'Submit Now';
    }
  }

  onAction(assignment: StudentAssignment): void {
    if (assignment.status === 'graded' || assignment.status === 'submitted') {
      this.router.navigate(['/student-course/assignment', assignment.id, 'view']);
    } else {
      this.router.navigate(['/student-course/assignment', assignment.id, 'submit']);
    }
  }

  private getMockAssignments(): StudentAssignment[] {
    return [
      {
        id: 'as1',
        title: 'Lab Report: Osmosis Experiment',
        courseName: 'Biology 101',
        subjectIcon: 'biotech',
        dueDate: '2026-09-06',
        maxPoints: 50,
        status: 'not-submitted',
      },
      {
        id: 'as2',
        title: 'Problem Set 4 — Quadratics',
        courseName: 'Mathematics I',
        subjectIcon: 'functions',
        dueDate: '2026-09-01',
        maxPoints: 30,
        status: 'submitted',
        submittedDate: '2026-08-30',
      },
      {
        id: 'as3',
        title: 'Essay: Causes of WWII',
        courseName: 'History',
        subjectIcon: 'history_edu',
        dueDate: '2026-08-18',
        maxPoints: 40,
        status: 'graded',
        submittedDate: '2026-08-17',
        grade: 36,
        feedback: 'Strong argument, cite more primary sources next time.',
      },
      {
        id: 'as4',
        title: 'Reading Response — Chapter 5',
        courseName: 'English Language',
        subjectIcon: 'menu_book',
        dueDate: '2026-08-24',
        maxPoints: 20,
        status: 'overdue',
      },
      {
        id: 'as5',
        title: 'Titration Data Analysis',
        courseName: 'Chemistry',
        subjectIcon: 'science',
        dueDate: '2026-09-12',
        maxPoints: 45,
        status: 'not-submitted',
      },
    ];
  }
}