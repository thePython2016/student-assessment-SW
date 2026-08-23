import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCourseDialog } from './edit-course-dialog';

describe('EditCourseDialog', () => {
  let component: EditCourseDialog;
  let fixture: ComponentFixture<EditCourseDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCourseDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCourseDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
