import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Allquestions } from './allquestions';

describe('Allquestions', () => {
  let component: Allquestions;
  let fixture: ComponentFixture<Allquestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allquestions],
    }).compileComponents();

    fixture = TestBed.createComponent(Allquestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
