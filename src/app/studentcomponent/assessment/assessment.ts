import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  id: number;
  title: string;
  dueLabel: string;
  dueInDays: number;          // used for sorting by due date
  durationMinutes: number;
  questionCount: number;
  icon: string;
  bg: string;
  fg: string;
  available: boolean;
}

interface PastResult {
  id: number;
  title: string;
  date: string;               // e.g. "Aug 21"
  ts: number;                 // real time, used for sorting
  score: number | null;       // percentage. null when missed or not marked yet
  status: 'Passed' | 'Failed' | 'Pending' | 'Missed';
}

@Component({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTableModule],
  selector: 'app-assessment',
  styleUrl: './assessment.css',
  templateUrl: './assessment.html',
})
export class Assessment implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  base = 'http://127.0.0.1:8000';

  filterOptions = ['All', 'Upcoming', 'Completed', 'Missed'];
  sortOptions = ['Due date', 'Most recent', 'Highest score', 'Lowest score'];

  activeFilter = 'All';
  activeSort = 'Due date';

  resultColumns = ['title', 'date', 'score', 'status'];

  loading = true;
  error = '';

  stats: StatCard[] = [
    { label: 'Upcoming', value: '0' },
    { label: 'Completed', value: '0' },
    { label: 'Average score', value: '-' },
    { label: 'Missed', value: '0', danger: true },
  ];

  // Real data from Django (filled by load()).
  upcomingAssessments: UpcomingAssessment[] = [];
  pastResults: PastResult[] = [];

  // What the page actually shows. Updated by refresh(), not recalculated on every check.
  upcomingView: UpcomingAssessment[] = [];
  resultsView: PastResult[] = [];

  ngOnInit(): void {
    this.load();
  }

  // TODO: replace with the id of the logged-in student from your login.
  private studentId(): number | null {
    const v = localStorage.getItem('studentId');
    return v ? Number(v) : null;
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const id = this.studentId();
      const url = `${this.base}/assessments/overview${id ? `?studentId=${id}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        this.error = 'Could not load your assessments';
        return;
      }
      const data = await response.json();

      this.upcomingAssessments = data.upcoming.map((a: any, i: number) => this.toUpcoming(a, i));
      this.pastResults = data.results.map((r: any) => this.toResult(r));

      this.stats = [
        { label: 'Upcoming', value: String(data.stats.upcoming) },
        { label: 'Completed', value: String(data.stats.completed) },
        { label: 'Average score', value: data.stats.average_score === null ? '-' : `${data.stats.average_score}%` },
        { label: 'Missed', value: String(data.stats.missed), danger: true },
      ];
      this.refresh();
    } catch (e) {
      this.error = 'Cannot reach the server';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  // ---- API -> screen ----
  private toUpcoming(a: any, i: number): UpcomingAssessment {
    const days = a.end ? Math.max(0, Math.ceil((new Date(a.end).getTime() - Date.now()) / 86400000)) : 999;
    const dueLabel = !a.end ? 'No deadline'
      : days === 0 ? 'Due today'
      : days === 1 ? 'Due tomorrow'
      : `Due in ${days} days`;

    const icons: Record<string, string> = {
      Quiz: 'quiz', Midterm: 'edit_note', Final: 'assignment', Assignment: 'assignment_turned_in', Practice: 'fitness_center',
    };
    const blue = { bg: '#eef4ff', fg: '#3b82f6' };
    const amber = { bg: '#fffaeb', fg: '#b54708' };
    const colour = i % 2 === 0 ? blue : amber;

    return {
      id: a.id,
      title: a.title,
      dueLabel,
      dueInDays: days,
      durationMinutes: a.duration,
      questionCount: a.question_count,
      icon: icons[a.type] ?? 'description',
      bg: colour.bg,
      fg: colour.fg,
      available: a.available,
    };
  }

  private toResult(r: any): PastResult {
    const d = new Date(r.date);
    return {
      id: r.id,
      title: r.title,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ts: d.getTime(),
      score: r.score,
      status: r.status,
    };
  }

  // ---- filters and sorting ----
  applyFilter(option: string): void {
    this.activeFilter = option;
    this.refresh();
  }

  applySort(option: string): void {
    this.activeSort = option;
    this.refresh();
  }

  get showUpcoming(): boolean {
    return this.activeFilter === 'All' || this.activeFilter === 'Upcoming';
  }

  get showResults(): boolean {
    return this.activeFilter !== 'Upcoming';
  }

  get resultsTitle(): string {
    return this.activeFilter === 'Missed' ? 'Missed assessments' : 'Past results';
  }

  private refresh(): void {
    // Upcoming assessments are always shown with the nearest deadline first.
    this.upcomingView = [...this.upcomingAssessments].sort((a, b) => a.dueInDays - b.dueInDays);

    const f = this.activeFilter;
    let rows = this.pastResults.filter((r) =>
      f === 'Completed' ? r.status !== 'Missed'
      : f === 'Missed' ? r.status === 'Missed'
      : true);

    switch (this.activeSort) {
      case 'Highest score':
        rows = rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        break;
      case 'Lowest score':
        rows = rows.sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
        break;
      default: // "Due date" and "Most recent" both show the newest results first
        rows = rows.sort((a, b) => b.ts - a.ts);
    }
    this.resultsView = rows;
  }

  // ---- actions ----
  startAssessment(assessment: UpcomingAssessment): void {
    if (!assessment.available) return;
    this.router.navigate(['/exam', assessment.id]);
  }

  viewAssessment(assessment: UpcomingAssessment): void {
    // The exam page opens on an overview of the assessment before it starts.
    this.router.navigate(['/exam', assessment.id]);
  }

  scoreClass(score: number | null): string {
    if (score === null) return '';
    return score >= 70 ? 'score-good' : score >= 50 ? 'score-mid' : 'score-low';
  }

  statusClass(status: PastResult['status']): string {
    switch (status) {
      case 'Passed':
        return 'status-passed';
      case 'Failed':
        return 'status-failed';
      case 'Pending':
        return 'status-pending';
      case 'Missed':
        return 'status-missed';
      default:
        return '';
    }
  }
}