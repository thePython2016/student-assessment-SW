import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

interface Student {
  id: number;
  name: string;
}

interface Recommendation {
  course: string;
  score: number;
}

@Component({
  selector: 'app-recommendations',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  styleUrl: './recommendations.css',
  templateUrl: './recommendations.html',
})
export class Recommendations {
  searchText = '';
  selectedStudent: Student | null = null;
  loading = false;
  recommendations: Recommendation[] = [];

  allStudents: Student[] = [
    { id: 11391, name: 'John Doe' },
    { id: 28400, name: 'Jane Smith' },
    { id: 30268, name: 'Michael Brown' },
    { id: 31604, name: 'Emily Davis' },
    { id: 32885, name: 'Chris Wilson' },
  ];

  get filteredStudents(): Student[] {
    if (!this.searchText) return this.allStudents;
    const query = this.searchText.toLowerCase();
    return this.allStudents.filter(s =>
      s.name.toLowerCase().includes(query) || s.id.toString().includes(query)
    );
  }

  displayStudent(student: Student): string {
    return student ? `${student.name} (ID: ${student.id})` : '';
  }

  onStudentSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedStudent = event.option.value;
    this.fetchRecommendations();
  }

  fetchRecommendations() {
    if (!this.selectedStudent) return;
    this.loading = true;
    this.recommendations = [];

    setTimeout(() => {
      this.recommendations = [
        { course: 'BBB', score: 0.91 },
        { course: 'FFF', score: 0.84 },
        { course: 'DDD', score: 0.77 },
      ];
      this.loading = false;
    }, 800);
  }

  clearSelection() {
    this.selectedStudent = null;
    this.searchText = '';
    this.recommendations = [];
  }
}