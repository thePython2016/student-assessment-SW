import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashLayout } from './dash-layout';

describe('DashLayout', () => {
  let component: DashLayout;
  let fixture: ComponentFixture<DashLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(DashLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
