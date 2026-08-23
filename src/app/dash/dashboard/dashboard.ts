import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

interface Kpi {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface QuickLink {
  label: string;
  icon: string;
  route: string;
  color: string;
}

interface Activity {
  text: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  adminName = 'Admin User';

  kpis: Kpi[] = [
    { label: 'Total Students', value: '1,284', icon: 'group', color: '#198754' },
    { label: 'Active Courses', value: '32', icon: 'menu_book', color: '#2b6cb0' },
    { label: 'Assessments This Month', value: '146', icon: 'assignment', color: '#f59e0b' },
    { label: 'At-Risk Students', value: '96', icon: 'warning', color: '#dc2626' },
  ];

  quickLinks: QuickLink[] = [
    { label: 'Add Student', icon: 'person_add', route: '/dash/student/add', color: '#198754' },
    { label: 'Add Course', icon: 'add_box', route: '/dash/course/add', color: '#2b6cb0' },
    { label: 'Create Assessment', icon: 'assignment_add', route: '/dash/assessment/create', color: '#f59e0b' },
    { label: 'View Analytics', icon: 'bar_chart', route: '/dash/analytics', color: '#8b5cf6' },
  ];

  recentActivity: Activity[] = [
    { text: 'John Doe submitted "Database Systems Quiz"', time: '10 minutes ago', icon: 'assignment_turned_in' },
    { text: 'New student Emily Davis registered', time: '1 hour ago', icon: 'person_add' },
    { text: 'Course "Network Protocols" was updated', time: '3 hours ago', icon: 'edit' },
    { text: 'Performance prediction flagged 3 students as at-risk', time: 'Yesterday', icon: 'warning' },
    { text: 'Assessment "Recursion Basics" was published', time: 'Yesterday', icon: 'publish' },
  ];
}