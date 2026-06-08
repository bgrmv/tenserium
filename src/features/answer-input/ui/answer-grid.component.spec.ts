import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerGridComponent } from './answer-grid.component';
import { provideRouter } from '@angular/router';

describe('AnswerGridComponent — hintId', () => {
  let component: AnswerGridComponent;
  let fixture: ComponentFixture<AnswerGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerGridComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return is-hint for the hinted tense when no reveal is set', () => {
    fixture.componentRef.setInput('hintId', 'present-simple');
    expect(component['stateClass']('present-simple', false)).toBe('is-hint');
  });

  it('should return empty string for non-hinted tenses', () => {
    fixture.componentRef.setInput('hintId', 'present-simple');
    expect(component['stateClass']('past-simple', false)).toBe('');
  });

  it('should return empty string when hintId is null', () => {
    fixture.componentRef.setInput('hintId', null);
    expect(component['stateClass']('present-simple', false)).toBe('');
  });

  it('should suppress is-hint once revealId is set', () => {
    fixture.componentRef.setInput('hintId', 'present-simple');
    fixture.componentRef.setInput('revealId', 'present-simple');
    // reveal takes precedence — should be is-correct, not is-hint
    expect(component['stateClass']('present-simple', false)).toBe('is-correct');
  });

  it('should return is-locked for locked tenses regardless of hintId', () => {
    fixture.componentRef.setInput('hintId', 'past-simple');
    expect(component['stateClass']('past-simple', true)).toBe('is-locked');
  });

  it('should return is-dim for non-picked, non-correct tenses after reveal', () => {
    fixture.componentRef.setInput('hintId', 'present-simple');
    fixture.componentRef.setInput('revealId', 'present-simple');
    expect(component['stateClass']('past-simple', false)).toBe('is-dim');
  });

  it('should return is-wrong for the picked wrong tense after reveal', () => {
    fixture.componentRef.setInput('revealId', 'present-simple');
    fixture.componentRef.setInput('pickedId', 'past-simple');
    expect(component['stateClass']('past-simple', false)).toBe('is-wrong');
  });
});
