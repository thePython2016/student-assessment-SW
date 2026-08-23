import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Performanceprediction } from './performanceprediction';

describe('Performanceprediction', () => {
  let component: Performanceprediction;
  let fixture: ComponentFixture<Performanceprediction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Performanceprediction],
    }).compileComponents();

    fixture = TestBed.createComponent(Performanceprediction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
