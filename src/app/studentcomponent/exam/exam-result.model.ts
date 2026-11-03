// Place at: src/app/studentcomponent/exam/exam-result.model.ts  (replaces the old one)

export interface ExamQuestion {
  id: number;
  text: string;
  marks: number;
}

// What GET assessments/<id>/questions returns (no correct answers)
export interface ExamInfo {
  id: number;
  title: string;
  duration: number;        // minutes
  totalMarks: number;
  autoSubmit: boolean;
  questions: ExamQuestion[];
}

export interface AnswerRecord {
  questionId: number;
  answer: string;          // 'True' or 'False'
}

// What the page sends when the student submits
export interface ExamSubmission {
  assessmentId: number;
  startedAt: string;       // ISO
  submittedAt: string;     // ISO
  timeSpentSec: number;
  autoSubmitted: boolean;  // true when the timer ran out
  answers: AnswerRecord[];
}

// What the server sends back (id is the Submission id)
export interface ExamResultData {
  id: number;
  assessmentId: number;
  title: string;
  status: 'Submitted' | 'Marked';
  score: number | null;    // null when results are not released yet
  totalMarks: number;
  passMarks: number;
  percentage: number | null;
  passed: boolean | null;
  timeSpentSec: number;
  submittedAt: string;
}