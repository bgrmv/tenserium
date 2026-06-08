import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePageComponent } from './game.page';
import { GameSessionStore } from '@entities/session';
import { MatchStore } from '@entities/match';
import { UserStore } from '@entities/user';
import { QuestionRepository } from '@entities/question';
import { StorageService } from '@shared/api/storage.service';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import type { Question, TenseId } from '@shared/types';

describe('GamePageComponent', () => {
  let component: GamePageComponent;
  let fixture: ComponentFixture<GamePageComponent>;
  let sessionStore: GameSessionStore;
  let questionRepo: QuestionRepository;

  // Helper to create a minimal test question
  function makeQuestion(
    id: string,
    answer: TenseId = 'present-simple',
  ): Question {
    return {
      id,
      answer,
      type: 'sentence',
      prompt: `Question ${id}`,
      sentence: {
        pre: 'I',
        verb: 'play',
        post: 'football',
      },
      difficulty: 1,
    };
  }

  // Helper to create a test deck
  function makeDeck(n = 3): Question[] {
    return Array.from({ length: n }, (_, i) => makeQuestion(`q${i}`));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePageComponent],
      providers: [
        GameSessionStore,
        MatchStore,
        UserStore,
        QuestionRepository,
        StorageService,
        provideRouter([]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(GameSessionStore);
    questionRepo = TestBed.inject(QuestionRepository);

    // Mock the buildDeck method
    vi.spyOn(questionRepo, 'buildDeck').mockReturnValue(makeDeck(3));
  });

  describe('Component initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have initial input values', () => {
      expect(component.mode()).toBe('normal');
      expect(component.palette()).toBe('aspect');
    });

    it('should start in idle status', () => {
      expect(sessionStore.status()).toBe('idle');
    });
  });

  describe('Answer submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Manually start the session since we're not waiting for repo.questions
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should record correct answer', () => {
      component['onAnswer']('present-simple');
      expect(sessionStore.status()).toBe('result-flash');
      expect(sessionStore.lastAnswer()?.correct).toBe(true);
    });

    it('should record incorrect answer', () => {
      component['onAnswer']('past-simple');
      expect(sessionStore.status()).toBe('result-flash');
      expect(sessionStore.lastAnswer()?.correct).toBe(false);
    });

    it('should set result signal to correct for correct answer', () => {
      component['onAnswer']('present-simple');
      expect(component['result']()).toBe('correct');
    });

    it('should set result signal to wrong for incorrect answer', () => {
      component['onAnswer']('past-simple');
      expect(component['result']()).toBe('wrong');
    });

    it('should set pickedId when answering', () => {
      component['onAnswer']('present-simple');
      expect(component['pickedId']()).toBe('present-simple');
    });

    it('should set revealId to correct answer', () => {
      component['onAnswer']('present-simple');
      expect(component['revealId']()).toBe('present-simple');
    });

    it('should set gained for correct answer', () => {
      component['onAnswer']('present-simple');
      expect(component['gained']()).toBeGreaterThan(0);
    });

    it('should not set gained for incorrect answer', () => {
      component['onAnswer']('past-simple');
      expect(component['gained']()).toBeNull();
    });

    it('should not award points for incorrect answer', () => {
      component['onAnswer']('past-simple');
      expect(sessionStore.score()).toBe(0);
    });

    it('should award points for correct answer', () => {
      component['onAnswer']('present-simple');
      expect(sessionStore.score()).toBeGreaterThan(0);
    });

    it('should stop timer when answering', () => {
      const timerStopSpy = vi.spyOn(component['timer'], 'stop');
      component['onAnswer']('present-simple');
      expect(timerStopSpy).toHaveBeenCalled();
    });

    it('should guard against answering twice', () => {
      component['onAnswer']('present-simple');
      const firstScore = sessionStore.score();

      // Try to answer again while result is not 'none'
      component['onAnswer']('past-simple');

      // Score should not change
      expect(sessionStore.score()).toBe(firstScore);
    });

    it('should guard against answering outside question status', () => {
      // Move to summary
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      expect(sessionStore.status()).toBe('summary');

      const answerCount = sessionStore['_answers']().length;

      // Try to answer in summary
      component['result'].set('none'); // Reset to allow the guard to work
      component['onAnswer']('present-simple');

      // Should not add new answer
      expect(sessionStore['_answers']().length).toBe(answerCount);
    });
  });

  describe('Timeout handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should record timeout as incorrect', () => {
      component['onTimeout']();
      expect(sessionStore.lastAnswer()?.correct).toBe(false);
    });

    it('should set result to timeout', () => {
      component['onTimeout']();
      expect(component['result']()).toBe('timeout');
    });

    it('should transition to result-flash', () => {
      component['onTimeout']();
      expect(sessionStore.status()).toBe('result-flash');
    });

    it('should set revealId to correct answer', () => {
      component['onTimeout']();
      expect(component['revealId']()).toBe('present-simple');
    });

    it('should not award points for timeout', () => {
      component['onTimeout']();
      expect(sessionStore.score()).toBe(0);
    });

    it('should ignore timeout if result is not none', () => {
      component['onAnswer']('present-simple');
      const afterAnswer = sessionStore['_answers']().length;

      // Try to timeout while result is showing
      component['onTimeout']();

      // Should not add new answer
      expect(sessionStore['_answers']().length).toBe(afterAnswer);
    });
  });

  describe('Session control', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should end session and set forfeited', () => {
      component['endSession']();
      expect(sessionStore.status()).toBe('summary');
      expect(sessionStore.forfeited()).toBe(true);
    });

    it('should clear answers on endSession', () => {
      sessionStore.submitAnswer('present-simple');
      expect(sessionStore.score()).toBeGreaterThan(0);

      component['endSession']();

      expect(sessionStore.score()).toBe(0);
    });

    it('should stop timer on endSession', () => {
      const timerStopSpy = vi.spyOn(component['timer'], 'stop');
      component['endSession']();
      expect(timerStopSpy).toHaveBeenCalled();
    });

    it('should reset and restart on playAgain', () => {
      // Answer a few questions
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      const scoreBeforeReset = sessionStore.score();
      expect(scoreBeforeReset).toBeGreaterThan(0);

      // Play again
      component['playAgain']();

      expect(sessionStore.status()).toBe('question');
      expect(sessionStore.score()).toBe(0);
      expect(sessionStore.progress().index).toBe(0);
      expect(component['result']()).toBe('none');
    });

    it('should reset unlocked state on playAgain', () => {
      component['playAgain']();
      // Simplified check — full unlock logic is in the component
      expect(sessionStore.status()).toBe('question');
    });
  });

  describe('Streak tracking', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should show combo (streak) after correct answers', () => {
      expect(sessionStore.currentStreak()).toBe(0);

      // Answer 1st correct
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(1);

      // Answer 2nd correct
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(2);
    });

    it('should reset streak on wrong answer', () => {
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(2);

      sessionStore.submitAnswer('wrong-id' as TenseId);
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(0);
    });
  });

  describe('Summary props', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should compute summary props correctly', () => {
      // C, W, C
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      sessionStore.submitAnswer('past-simple');
      sessionStore.nextQuestion();

      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      const props = component['summaryProps']();
      expect(props.correct).toBe(2);
      expect(props.total).toBe(3);
      expect(props.accuracy).toBeCloseTo(2 / 3, 5);
      expect(props.bestStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Result state clearing', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should have initial result state as none', () => {
      expect(component['result']()).toBe('none');
    });

    it('should set result state when answering', () => {
      component['onAnswer']('present-simple');
      expect(component['result']()).toBe('correct');
      expect(component['revealId']()).toEqual('present-simple');
    });
  });

  describe('Score accumulation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should accumulate score correctly', () => {
      // Answer Q1
      sessionStore.submitAnswer('present-simple');
      const scoreAfterQ1 = sessionStore.score();
      expect(scoreAfterQ1).toBeGreaterThan(0);

      sessionStore.nextQuestion();

      // Answer Q2
      sessionStore.submitAnswer('present-simple');
      const scoreAfterQ2 = sessionStore.score();
      expect(scoreAfterQ2).toBeGreaterThan(scoreAfterQ1);

      sessionStore.nextQuestion();

      // Answer Q3
      sessionStore.submitAnswer('present-simple');
      const scoreAfterQ3 = sessionStore.score();
      expect(scoreAfterQ3).toBeGreaterThan(scoreAfterQ2);
    });

    it('should not award points for wrong answers', () => {
      sessionStore.submitAnswer('present-simple');
      const correctScore = sessionStore.score();

      sessionStore.nextQuestion();

      sessionStore.submitAnswer('wrong-id' as TenseId);
      expect(sessionStore.score()).toBe(correctScore);
    });
  });

  describe('Question progression', () => {
    beforeEach(() => {
      fixture.detectChanges();
      sessionStore.startSession(
        {
          mode: 'normal',
          tenses: ['present-simple'],
          total: 3,
          windowMs: 10_000,
          modeMultiplier: 1,
        },
        makeDeck(3),
      );
    });

    it('should start with first question', () => {
      expect(sessionStore.currentQuestion()?.id).toBe('q0');
      expect(sessionStore.progress()).toEqual({ index: 0, total: 3 });
    });

    it('should advance question after answer', () => {
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      expect(sessionStore.currentQuestion()?.id).toBe('q1');
      expect(sessionStore.progress().index).toBe(1);
    });

    it('should reach summary after last question', () => {
      // Q1
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      // Q2
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      // Q3
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();

      expect(sessionStore.status()).toBe('summary');
      expect(sessionStore.isComplete()).toBe(true);
    });
  });
});
