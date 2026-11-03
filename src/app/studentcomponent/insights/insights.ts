import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type RiskLevel = 'on-track' | 'needs-attention' | 'at-risk';

export interface TopicRecommendation {
  topic: string;
  courseName: string;
  masteryPercent: number;
  suggestion: string;
  resourceLink: string;
}

export interface NextStep { icon: string; text: string; }
export interface StudyPattern { icon: string; text: string; }

interface InsightsData {
  has_data: boolean;
  riskLevel?: RiskLevel;
  summary?: string;
  courseAverageComparison?: string;
  topicRecommendations?: TopicRecommendation[];
  nextSteps?: NextStep[];
  studyPatterns?: StudyPattern[];
}

@Component({
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  selector: 'app-insights',
  styleUrl: './insights.css',
  templateUrl: './insights.html',
})
export class Insights implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private api = 'https://student-assessment-alis.onrender.com';

  loading = true;
  error = '';
  hasData = false;

  riskLevel: RiskLevel = 'on-track';
  summary = '';
  courseAverageComparison = '';
  topicRecommendations: TopicRecommendation[] = [];
  nextSteps: NextStep[] = [];
  studyPatterns: StudyPattern[] = [];

  ngOnInit() {
    this.http.get<InsightsData>(`${this.api}/exam/insights/`, { headers: this.headers() }).subscribe({
      next: (d) => {
        this.hasData = d.has_data;
        if (d.has_data) {
          this.riskLevel = d.riskLevel ?? 'on-track';
          this.summary = d.summary ?? '';
          this.courseAverageComparison = d.courseAverageComparison ?? '';
          this.topicRecommendations = d.topicRecommendations ?? [];
          this.nextSteps = d.nextSteps ?? [];
          this.studyPatterns = d.studyPatterns ?? [];
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not load insights (status ${err.status}).`;
        this.cdr.markForCheck();
      },
    });
  }

  private headers(): HttpHeaders {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : '';
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  riskLabel(): string {
    switch (this.riskLevel) {
      case 'on-track': return 'On track';
      case 'needs-attention': return 'Needs attention';
      case 'at-risk': return 'At risk';
    }
  }

  masteryColor(percent: number): string {
    if (percent < 60) return 'var(--text-danger, #dc2626)';
    if (percent < 80) return 'var(--text-warning, #d97706)';
    return 'var(--text-success, #16a34a)';
  }

  goToResource(link: string): void {
    this.router.navigateByUrl(link);
  }
}