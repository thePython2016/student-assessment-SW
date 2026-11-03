import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableExam } from './available-exam';

describe('AvailableExam', () => {
  let component: AvailableExam;
  let fixture: ComponentFixture<AvailableExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableExam],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableExam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
