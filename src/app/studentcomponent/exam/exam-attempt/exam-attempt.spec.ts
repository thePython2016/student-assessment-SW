import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamAttempt } from './exam-attempt';

describe('ExamAttempt', () => {
  let component: ExamAttempt;
  let fixture: ComponentFixture<ExamAttempt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamAttempt],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamAttempt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
