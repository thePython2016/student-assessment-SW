import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttemptHistory } from './attempt-history';

describe('AttemptHistory', () => {
  let component: AttemptHistory;
  let fixture: ComponentFixture<AttemptHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(AttemptHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
