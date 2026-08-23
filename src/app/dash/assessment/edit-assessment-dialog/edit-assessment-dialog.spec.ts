import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAssessmentDialog } from './edit-assessment-dialog';

describe('EditAssessmentDialog', () => {
  let component: EditAssessmentDialog;
  let fixture: ComponentFixture<EditAssessmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssessmentDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssessmentDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
