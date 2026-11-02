import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerformancePrediction } from './performance-prediction';

describe('PerformancePrediction', () => {
  let component: PerformancePrediction;
  let fixture: ComponentFixture<PerformancePrediction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformancePrediction],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformancePrediction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
