import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import Chart from 'chart.js/auto';

export interface SubjectScore {
  subject: string;
  score: number;
}

export interface TopicMastery {
  topic: string;
  masteryPercent: number;
}

@Component({
  imports: [CommonModule, MatIconModule],
  selector: 'app-performance',
  styleUrl: './performance.css',
  templateUrl: './performance.html',
})
export class Performance implements AfterViewInit {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('subjectCanvas') subjectCanvas!: ElementRef<HTMLCanvasElement>;

  overallAverage = 82;
  trendDelta = 6;
  strongestSubject = 'History';
  weakestSubject = 'Chemistry';

  trendLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug'];
  trendScores = [71, 74, 76, 79, 82];

  subjectScores: SubjectScore[] = [
    { subject: 'Biology', score: 85 },
    { subject: 'Mathematics', score: 78 },
    { subject: 'History', score: 91 },
    { subject: 'English', score: 80 },
    { subject: 'Chemistry', score: 62 },
  ];

  topicMastery: TopicMastery[] = [
    { topic: 'Stoichiometry', masteryPercent: 54 },
    { topic: 'Quadratic equations', masteryPercent: 76 },
    { topic: 'WWII causes', masteryPercent: 94 },
  ];

  insightMessage =
    "Focus on stoichiometry next — it's your lowest-scoring topic and appears in 3 upcoming assessments.";

  ngAfterViewInit(): void {
    // TODO: replace mock data above with a call to the FastAPI backend,
    // e.g. this.performanceService.getStudentPerformance().subscribe(data => { ...; this.renderCharts(); });
    this.renderCharts();
  }

  masteryColor(percent: number): string {
    if (percent < 60) return 'var(--text-danger, #dc2626)';
    if (percent < 80) return 'var(--text-warning, #d97706)';
    return 'var(--text-success, #16a34a)';
  }

  private renderCharts(): void {
    new Chart(this.trendCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.trendLabels,
        datasets: [
          {
            data: this.trendScores,
            borderColor: '#2a78d6',
            backgroundColor: 'rgba(42,120,214,0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 60, max: 100 } },
      },
    });

    new Chart(this.subjectCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.subjectScores.map(s => s.subject),
        datasets: [
          {
            data: this.subjectScores.map(s => s.score),
            backgroundColor: '#2a78d6',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } },
      },
    });
  }
}