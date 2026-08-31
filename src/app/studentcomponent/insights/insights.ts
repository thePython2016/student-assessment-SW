import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

export interface NextStep {
  icon: string;
  text: string;
}

export interface StudyPattern {
  icon: string;
  text: string;
}

@Component({
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  selector: 'app-insights',
  styleUrl: './insights.css',
  templateUrl: './insights.html',
})
export class Insights {
  riskLevel: RiskLevel = 'needs-attention';

  summary =
    "You're doing well overall, up 6% over the last month and excelling in History. " +
    'Chemistry is pulling your average down, mainly around stoichiometry, which shows up in ' +
    'three of your next four assessments — that would be the highest-impact thing to fix right now.';

  courseAverageComparison = '5% above class average';

  topicRecommendations: TopicRecommendation[] = [
    {
      topic: 'Stoichiometry',
      courseName: 'Chemistry',
      masteryPercent: 54,
      suggestion: 'Work through the mole-ratio practice set before your next quiz.',
      resourceLink: '/study-materials',
    },
    {
      topic: 'Quadratic equations',
      courseName: 'Mathematics I',
      masteryPercent: 76,
      suggestion: 'Review factoring methods — you missed similar questions twice.',
      resourceLink: '/study-materials',
    },
  ];

  nextSteps: NextStep[] = [
    { icon: 'refresh', text: 'Retake the topics you missed on Quiz 2 (Algebra II)' },
    { icon: 'menu_book', text: 'Review stoichiometry before the Sept 10 Chemistry test' },
    { icon: 'event', text: 'Start the Geometry practice test a day earlier than usual' },
  ];

  studyPatterns: StudyPattern[] = [
    { icon: 'trending_up', text: 'Average score has improved for 4 months in a row.' },
    { icon: 'schedule', text: 'You tend to complete assessments close to the deadline — starting earlier tends to raise scores.' },
    { icon: 'repeat', text: 'Stoichiometry questions have been missed across 3 separate assessments.' },
  ];

  constructor(private router: Router) {
    // TODO: replace mock data above with a call to the FastAPI backend,
    // e.g. this.insightsService.getStudentInsights().subscribe(data => { ... });
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