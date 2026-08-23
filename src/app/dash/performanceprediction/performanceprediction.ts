import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

interface Student {
  id: number;
  name: string;
}

interface Prediction {
  predictedScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  factors: string[];
}

@Component({
  selector: 'app-performanceprediction',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  styleUrl: './performanceprediction.css',
  templateUrl: './performanceprediction.html',
})
export class Performanceprediction {
  searchText = '';
  selectedStudent: Student | null = null;
  loading = false;
  prediction: Prediction | null = null;

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
    this.fetchPrediction();
  }

  fetchPrediction() {
    if (!this.selectedStudent) return;
    this.loading = true;
    this.prediction = null;

    setTimeout(() => {
      this.prediction = {
        predictedScore: 68,
        riskLevel: 'Medium',
        factors: ['Low assessment submission rate', 'Declining scores in recent quizzes', 'Irregular login activity']
      };
      this.loading = false;
    }, 800);
  }

  clearSelection() {
    this.selectedStudent = null;
    this.searchText = '';
    this.prediction = null;
  }

  getRiskColor(): string {
    if (!this.prediction) return '';
    switch (this.prediction.riskLevel) {
      case 'Low': return '#198754';
      case 'Medium': return '#f59e0b';
      case 'High': return '#dc2626';
      default: return '#64748b';
    }
  }
}