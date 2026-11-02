import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralPrediction } from './general-prediction';

describe('GeneralPrediction', () => {
  let component: GeneralPrediction;
  let fixture: ComponentFixture<GeneralPrediction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralPrediction],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralPrediction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
