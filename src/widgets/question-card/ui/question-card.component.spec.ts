import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionCardComponent } from './question-card.component';
import type { QuestionSentence } from '@shared/types';

describe('QuestionCardComponent', () => {
  let component: QuestionCardComponent;
  let fixture: ComponentFixture<QuestionCardComponent>;

  const SENTENCE: QuestionSentence = {
    pre: 'She always ',
    verb: 'drinks',
    post: ' tea.',
    answer: 'present-simple',
  };

  function el<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return fixture.nativeElement.querySelector(selector) as T | null;
  }

  function els<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector)) as T[];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('prompt', 'Test prompt');
    fixture.detectChanges();
  });

  // ── Prompt ───────────────────────────────────────────────────────────

  describe('prompt display', () => {
    it('should render the prompt text', () => {
      expect(el('.prompt-quote')?.textContent).toContain('Test prompt');
    });

    it('should update when prompt changes', () => {
      fixture.componentRef.setInput('prompt', 'New prompt');
      fixture.detectChanges();
      expect(el('.prompt-quote')?.textContent).toContain('New prompt');
    });
  });

  // ── Result state ─────────────────────────────────────────────────────

  describe('result state', () => {
    it('should apply r-none class by default', () => {
      expect(el('.prompt-card')?.className).toContain('r-none');
    });

    it('should apply r-correct class', () => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();
      expect(el('.prompt-card')?.className).toContain('r-correct');
    });

    it('should apply r-wrong class', () => {
      fixture.componentRef.setInput('result', 'wrong');
      fixture.detectChanges();
      expect(el('.prompt-card')?.className).toContain('r-wrong');
    });

    it('should apply r-timeout class', () => {
      fixture.componentRef.setInput('result', 'timeout');
      fixture.detectChanges();
      expect(el('.prompt-card')?.className).toContain('r-timeout');
    });
  });

  // ── Timer ────────────────────────────────────────────────────────────

  describe('timer', () => {
    it('should show seconds formatted to one decimal', () => {
      fixture.componentRef.setInput('remainingMs', 9500);
      fixture.detectChanges();
      expect(el('.timer-num')?.textContent).toContain('9.5');
    });

    it('should add low class when under 3000ms', () => {
      fixture.componentRef.setInput('remainingMs', 2999);
      fixture.detectChanges();
      expect(el('.timer-num')?.classList.contains('low')).toBe(true);
    });

    it('should not add low class at exactly 3000ms', () => {
      fixture.componentRef.setInput('remainingMs', 3000);
      fixture.detectChanges();
      expect(el('.timer-num')?.classList.contains('low')).toBe(false);
    });

    it('should set timer bar width from fraction', () => {
      fixture.componentRef.setInput('fraction', 0.6);
      fixture.detectChanges();
      expect(el<HTMLElement>('.timer-fill')?.style.width).toBe('60%');
    });
  });

  // ── Reveal — visibility ──────────────────────────────────────────────

  describe('reveal visibility', () => {
    it('should hide reveal when result is none', () => {
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.detectChanges();
      expect(el('.reveal')).toBeNull();
    });

    it('should hide reveal when revealName is null even with a result', () => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();
      expect(el('.reveal')).toBeNull();
    });

    it('should show reveal when result is correct and revealName is set', () => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.detectChanges();
      expect(el('.reveal')).not.toBeNull();
    });

    it('should show reveal when result is wrong', () => {
      fixture.componentRef.setInput('result', 'wrong');
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.detectChanges();
      expect(el('.reveal')).not.toBeNull();
    });

    it('should show reveal when result is timeout', () => {
      fixture.componentRef.setInput('result', 'timeout');
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.detectChanges();
      expect(el('.reveal')).not.toBeNull();
    });
  });

  // ── Reveal — label ───────────────────────────────────────────────────

  describe('reveal label', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.detectChanges();
    });

    it('should display the reveal name', () => {
      expect(el('.reveal-label')?.textContent?.trim()).toBe('Present Simple');
    });

    it('should apply the default accent color', () => {
      expect(el<HTMLElement>('.reveal-label')?.style.color).toBe('var(--accent)');
    });

    it('should apply a custom revealColor', () => {
      fixture.componentRef.setInput('revealColor', 'oklch(0.76 0.15 158)');
      fixture.detectChanges();
      expect(el<HTMLElement>('.reveal-label')?.style.color).toBe('oklch(0.76 0.15 158)');
    });
  });

  // ── Reveal — sentence rendering ─────────────────────────────────────

  describe('sentence rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.componentRef.setInput('revealSentence', SENTENCE);
      fixture.detectChanges();
    });

    it('should render three spans: pre, verb, post', () => {
      expect(els('.reveal-sentence span').length).toBe(3);
    });

    it('should render pre and post with tok-other class', () => {
      const spans = els('.reveal-sentence span');
      expect(spans[0].classList.contains('tok-other')).toBe(true);
      expect(spans[2].classList.contains('tok-other')).toBe(true);
    });

    it('should render verb with tok-keyword class', () => {
      const spans = els('.reveal-sentence span');
      expect(spans[1].classList.contains('tok-keyword')).toBe(true);
    });

    it('should render correct text content', () => {
      const spans = els('.reveal-sentence span');
      expect(spans[0].textContent).toBe('She always ');
      expect(spans[1].textContent).toBe('drinks');
      expect(spans[2].textContent).toBe(' tea.');
    });

    it('should apply revealColor to keyword span', () => {
      fixture.componentRef.setInput('revealColor', 'oklch(0.76 0.15 158)');
      fixture.detectChanges();
      const keywordSpan = el('.tok-keyword') as HTMLElement;
      expect(keywordSpan.style.color).toBe('oklch(0.76 0.15 158)');
    });

    it('should not apply inline color to pre/post spans', () => {
      const spans = els<HTMLElement>('.reveal-sentence span');
      expect(spans[0].style.color).toBe('');
      expect(spans[2].style.color).toBe('');
    });

    it('should hide reveal-sentence when revealSentence is null', () => {
      fixture.componentRef.setInput('revealSentence', null);
      fixture.detectChanges();
      expect(el('.reveal-sentence')).toBeNull();
    });
  });

  // ── Points pop ───────────────────────────────────────────────────────

  describe('points pop', () => {
    it('should not show points for result none', () => {
      fixture.componentRef.setInput('gainedPoints', 150);
      fixture.detectChanges();
      expect(el('.points-pop')).toBeNull();
    });

    it('should not show points for wrong result', () => {
      fixture.componentRef.setInput('result', 'wrong');
      fixture.componentRef.setInput('gainedPoints', 150);
      fixture.detectChanges();
      expect(el('.points-pop')).toBeNull();
    });

    it('should show points for correct result with gainedPoints', () => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.componentRef.setInput('gainedPoints', 150);
      fixture.detectChanges();
      expect(el('.points-pop')?.textContent?.trim()).toBe('+150');
    });

    it('should not show points when gainedPoints is null', () => {
      fixture.componentRef.setInput('result', 'correct');
      fixture.componentRef.setInput('gainedPoints', null);
      fixture.detectChanges();
      expect(el('.points-pop')).toBeNull();
    });
  });
});
