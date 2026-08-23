import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface Kpi {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend: string;
  trendUp: boolean;
}

interface CourseScore {
  course: string;
  avgScore: number;
}

interface MonthTrend {
  month: string;
  avgScore: number;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  styleUrl: './analytics.css',
  templateUrl: './analytics.html',
})
export class Analytics {
  kpis: Kpi[] = [
    { label: 'Total Students', value: '1,284', icon: 'group', color: '#198754', trend: '+4.2%', trendUp: true },
    { label: 'Assessments Taken', value: '3,927', icon: 'assignment', color: '#2b6cb0', trend: '+12.1%', trendUp: true },
    { label: 'Average Score', value: '74.3%', icon: 'trending_up', color: '#f59e0b', trend: '-1.8%', trendUp: false },
    { label: 'Pass Rate', value: '81%', icon: 'check_circle', color: '#198754', trend: '+2.5%', trendUp: true },
    { label: 'At-Risk Students', value: '96', icon: 'warning', color: '#dc2626', trend: '+8 this month', trendUp: false },
  ];

  monthlyTrend: MonthTrend[] = [
    { month: 'Mar', avgScore: 68 },
    { month: 'Apr', avgScore: 71 },
    { month: 'May', avgScore: 69 },
    { month: 'Jun', avgScore: 75 },
    { month: 'Jul', avgScore: 73 },
    { month: 'Aug', avgScore: 74 },
  ];

  courseScores: CourseScore[] = [
    { course: 'AAA', avgScore: 82 },
    { course: 'BBB', avgScore: 65 },
    { course: 'CCC', avgScore: 74 },
    { course: 'DDD', avgScore: 58 },
    { course: 'EEE', avgScore: 88 },
    { course: 'FFF', avgScore: 71 },
  ];

  passFail = {
    pass: 81,
    fail: 19
  };

  weakTopics: { topic: string; missRate: number }[] = [
    { topic: 'Database Normalization', missRate: 62 },
    { topic: 'Recursion', missRate: 55 },
    { topic: 'Network Protocols', missRate: 48 },
    { topic: 'Statistical Inference', missRate: 44 },
  ];

  get maxMonthlyScore(): number {
    return Math.max(...this.monthlyTrend.map(m => m.avgScore));
  }

  get maxCourseScore(): number {
    return Math.max(...this.courseScores.map(c => c.avgScore));
  }
}