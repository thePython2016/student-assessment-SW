import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';

interface StatCard {
  label: string;
  value: string;
  danger?: boolean;
}

interface UpcomingAssessment {
  title: string;
  dueLabel: string;
  durationMinutes: number;
  questionCount: number;
  icon: string;
  bg: string;
  fg: string;
  available: boolean;
}

interface PastResult {
  title: string;
  date: string;
  score: number;
  status: 'Passed' | 'Failed' | 'Pending';
}

@Component({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTableModule],
  selector: 'app-assessment',
  styleUrl: './assessment.css',
  templateUrl: './assessment.html',
})
export class Assessment {
  filterOptions = ['All', 'Upcoming', 'Completed', 'Missed'];
  sortOptions = ['Due date', 'Most recent', 'Highest score', 'Lowest score'];

  resultColumns = ['title', 'date', 'score', 'status'];

  stats: StatCard[] = [
    { label: 'Upcoming', value: '3' },
    { label: 'Completed', value: '11' },
    { label: 'Average score', value: '82%' },
    { label: 'Missed', value: '1', danger: true },
  ];

  upcomingAssessments: UpcomingAssessment[] = [
    {
      title: 'Mid-term mathematics',
      dueLabel: 'Due tomorrow',
      durationMinutes: 60,
      questionCount: 10,
      icon: 'calculate',
      bg: '#eef4ff',
      fg: '#3b82f6',
      available: true,
    },
    {
      title: 'Statistics quiz',
      dueLabel: 'Due in 3 days',
      durationMinutes: 30,
      questionCount: 15,
      icon: 'bar_chart',
      bg: '#fffaeb',
      fg: '#b54708',
      available: false,
    },
    {
      title: 'Geometry practice test',
      dueLabel: 'Due in 6 days',
      durationMinutes: 45,
      questionCount: 12,
      icon: 'change_history',
      bg: '#eef4ff',
      fg: '#3b82f6',
      available: false,
    },
  ];

  pastResults: PastResult[] = [
    { title: 'Quiz 3 – Trigonometry', date: 'Aug 21', score: 92, status: 'Passed' },
    { title: 'Quiz 2 – Algebra II', date: 'Aug 10', score: 65, status: 'Passed' },
    { title: 'Quiz 1 – Statistics basics', date: 'Jul 28', score: 48, status: 'Failed' },
  ];

  applyFilter(option: string): void {
    // Placeholder — wire up filtering logic
  }

  applySort(option: string): void {
    // Placeholder — wire up sorting logic
  }

  startAssessment(assessment: UpcomingAssessment): void {
    // Placeholder — navigate to assessment-taking flow
  }

  viewAssessment(assessment: UpcomingAssessment): void {
    // Placeholder — navigate to assessment detail view
  }

  statusClass(status: PastResult['status']): string {
    switch (status) {
      case 'Passed':
        return 'status-passed';
      case 'Failed':
        return 'status-failed';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  }
}