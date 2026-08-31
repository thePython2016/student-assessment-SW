import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Chart from 'chart.js/auto';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  bg: string;
  fg: string;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  color: string;
}

interface UpcomingAssessment {
  title: string;
  dueLabel: string;
  durationMinutes: number;
}

interface StudentRow {
  name: string;
  studentId: string;
  group: string;
  markSheet: string;
  status: 'Excellent' | 'Good' | 'At risk';
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  styleUrl: './student-dashboard.css',
  templateUrl: './student-dashboard.html',
})
export class StudentDashboard implements AfterViewInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  studentName = 'Amina';
  searchQuery = '';

  stats: StatCard[] = [
    { label: 'Total Assessments', value: '300', icon: 'description', bg: '#e6f4ea', fg: '#2e7d32' },
    { label: 'Missed Deadlines', value: '15%', icon: 'event_busy', bg: '#fdecea', fg: '#d32f2f' },
    { label: 'Attendance Rate', value: '95%', icon: 'check_circle', bg: '#111827', fg: '#ffffff' },
    { label: 'Overall Score', value: '78%', icon: 'emoji_events', bg: '#fff8e1', fg: '#f9a825' },
  ];

  subjectBreakdown: SubjectPerformance[] = [
    { subject: 'Mathematics', score: 85, color: '#3b82f6' },
    { subject: 'Physics', score: 61, color: '#f59e0b' },
    { subject: 'Chemistry', score: 47, color: '#ef4444' },
  ];

  upcomingAssessments: UpcomingAssessment[] = [
    { title: 'Biology quiz', dueLabel: 'Due tomorrow', durationMinutes: 30 },
    { title: 'Mathematics test', dueLabel: 'Due in 4 days', durationMinutes: 60 },
  ];

  studentRows: StudentRow[] = [
    { name: 'Amina Hassan', studentId: 'STD-2201', group: 'Class 10A', markSheet: 'View', status: 'Excellent' },
    { name: 'John Mushi', studentId: 'STD-2202', group: 'Class 10A', markSheet: 'View', status: 'Good' },
    { name: 'Grace Peter', studentId: 'STD-2203', group: 'Class 10A', markSheet: 'View', status: 'At risk' },
  ];

  private scoreTrend = [62, 68, 71, 75, 73, 78, 80];
  private scoreTrendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  statusClass(status: string): string {
    if (status === 'Excellent') return 'status excellent';
    if (status === 'Good') return 'status good';
    return 'status risk';
  }

  ngAfterViewInit(): void {
    new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.scoreTrendLabels,
        datasets: [
          {
            data: this.scoreTrend,
            borderColor: '#111827',
            backgroundColor: 'rgba(17,24,39,0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#111827',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { font: { size: 11 } }, grid: { color: '#f3f4f6' } },
          x: { ticks: { font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
  }
}