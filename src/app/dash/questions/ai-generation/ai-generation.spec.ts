import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AIGeneration } from './ai-generation';

describe('AIGeneration', () => {
  let component: AIGeneration;
  let fixture: ComponentFixture<AIGeneration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIGeneration],
    }).compileComponents();

    fixture = TestBed.createComponent(AIGeneration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
