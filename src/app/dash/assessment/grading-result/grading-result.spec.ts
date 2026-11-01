import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradingResult } from './grading-result';

describe('GradingResult', () => {
  let component: GradingResult;
  let fixture: ComponentFixture<GradingResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingResult],
    }).compileComponents();

    fixture = TestBed.createComponent(GradingResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
