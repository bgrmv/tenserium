import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Annotation, QuestionSentence } from '@shared/types';
import { tokenizeSentence } from '@shared/lib/tokenize';
import { QuestionCardComponent } from './question-card.component';

describe('QuestionCardComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: QuestionCardComponent;
  let fixture: ComponentFixture<QuestionCardComponent>;

  const SENTENCE: QuestionSentence = {
    tokens: tokenizeSentence('She always ', 'drinks', ' tea.'),
    answer: 'present-simple',
  };

  const ANN: Annotation = {
    from: 2,
    to: 2,
    note: { en: 'Third person singular adds -s', ru: 'Третье лицо ед. ч.' },
  };

  const SENTENCE_WITH_ANN: QuestionSentence = { ...SENTENCE, annotations: [ANN] };

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

    it('should render full sentence text', () => {
      const sentence = el('.reveal-sentence') as HTMLElement;
      expect(sentence.textContent).toBe('She always drinks tea.');
    });

    it('should render the verb token with tok-keyword class', () => {
      const keywordSpans = els('.reveal-sentence .tok-keyword');
      expect(keywordSpans.length).toBe(1);
      expect(keywordSpans[0].textContent).toBe('drinks');
    });

    it('should render tok-other spans for word tokens outside verb', () => {
      const wordSpans = els('.reveal-sentence .tok-other');
      const texts = wordSpans.map(s => s.textContent);
      expect(texts).toContain('She');
      expect(texts).toContain('always');
      expect(texts).toContain('tea');
    });

    it('should render a tok-punct span for the period', () => {
      const punctSpans = els('.reveal-sentence .tok-punct');
      expect(punctSpans.length).toBeGreaterThan(0);
      expect(punctSpans[0].textContent).toBe('.');
    });

    it('should apply revealColor to tok-keyword span', () => {
      fixture.componentRef.setInput('revealColor', 'oklch(0.76 0.15 158)');
      fixture.detectChanges();
      const keywordSpan = el<HTMLElement>('.tok-keyword')!;
      expect(keywordSpan.style.color).toBe('oklch(0.76 0.15 158)');
    });

    it('should not apply inline color to non-keyword spans', () => {
      const otherSpans = els<HTMLElement>('.reveal-sentence .tok-other');
      for (const span of otherSpans) {
        expect(span.style.color).toBe('');
      }
    });

    it('should hide reveal-sentence when revealSentence is null', () => {
      fixture.componentRef.setInput('revealSentence', null);
      fixture.detectChanges();
      expect(el('.reveal-sentence')).toBeNull();
    });
  });

  // ── Auto-annotation ──────────────────────────────────────────────────

  describe('autoAnnotation', () => {
    it('should not auto-show annotation by default', () => {
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.componentRef.setInput('revealSentence', SENTENCE_WITH_ANN);
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();
      expect(el('app-annotation-tooltip')).toBeNull();
    });

    it('should auto-show first annotation when autoAnnotation is true', () => {
      fixture.componentRef.setInput('autoAnnotation', true);
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.componentRef.setInput('revealSentence', SENTENCE_WITH_ANN);
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();
      expect(el('app-annotation-tooltip')).not.toBeNull();
    });

    it('should clear annotation when result returns to none', () => {
      fixture.componentRef.setInput('autoAnnotation', true);
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.componentRef.setInput('revealSentence', SENTENCE_WITH_ANN);
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();

      fixture.componentRef.setInput('result', 'none');
      fixture.detectChanges();
      expect(el('app-annotation-tooltip')).toBeNull();
    });

    it('should not auto-show annotation when sentence has no annotations', () => {
      fixture.componentRef.setInput('autoAnnotation', true);
      fixture.componentRef.setInput('revealName', 'Present Simple');
      fixture.componentRef.setInput('revealSentence', SENTENCE);
      fixture.componentRef.setInput('result', 'correct');
      fixture.detectChanges();
      expect(el('app-annotation-tooltip')).toBeNull();
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
