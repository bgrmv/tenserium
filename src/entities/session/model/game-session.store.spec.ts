import { TestBed } from '@angular/core/testing';
import { GameSessionStore } from './game-session.store';
import { StorageService } from '@shared/api/storage.service';
import type { Question, SessionConfig, TenseId } from '@shared/types';
import { tokenizeSentence } from '@shared/lib/tokenize';

describe('GameSessionStore', () => {
  let store: GameSessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameSessionStore, StorageService],
    });
    store = TestBed.inject(GameSessionStore);
  });

  // Helper to create a minimal test question
  function makeQuestion(
    id: string,
    answer: TenseId = 'present-simple',
  ): Question {
    return {
      id,
      mechanism: 'context',
      prompt: { en: `Question ${id}`, ru: `Вопрос ${id}` },
      sentences: [
        { tokens: tokenizeSentence('I ', 'play', ' football'), answer },
      ],
      tags: ['present-simple', 'affirmative'],
      difficulty: 1,
    };
  }

  // Helper to create a test deck
  function makeDeck(n = 3): Question[] {
    return Array.from({ length: n }, (_, i) => makeQuestion(`q${i}`));
  }

  // Helper to create a session config
  function makeConfig(overrides = {}): SessionConfig {
    return {
      mode: 'normal',
      tenses: ['present-simple'],
      total: 3,
      windowMs: 10_000,
      modeMultiplier: 1,
      ...overrides,
    };
  }

  describe('Initial state', () => {
    it('should start in idle status', () => {
      expect(store.status()).toBe('idle');
    });

    it('should have no current question when idle', () => {
      expect(store.currentQuestion()).toBeNull();
    });

    it('should have zero score', () => {
      expect(store.score()).toBe(0);
    });

    it('should have zero streak', () => {
      expect(store.currentStreak()).toBe(0);
    });

    it('should have 100% accuracy when no answers', () => {
      expect(store.accuracy()).toBe(1);
    });

    it('should not be complete', () => {
      expect(store.isComplete()).toBe(false);
    });

    it('should not be forfeited', () => {
      expect(store.forfeited()).toBe(false);
    });
  });

  describe('startSession', () => {
    it('should transition to question status', () => {
      store.startSession(makeConfig(), makeDeck());
      expect(store.status()).toBe('question');
    });

    it('should load the first question', () => {
      const deck = makeDeck();
      store.startSession(makeConfig(), deck);
      expect(store.currentQuestion()).toEqual(deck[0]);
    });

    it('should set progress to 0/total', () => {
      store.startSession(makeConfig(), makeDeck(5));
      expect(store.progress()).toEqual({ index: 0, total: 5 });
    });

    it('should clear previous answers', () => {
      // Start and answer a question
      store.startSession(makeConfig(), makeDeck(2));
      store.submitAnswer('present-simple');
      expect(store.score()).toBeGreaterThan(0);

      // Start a new session — score should reset
      store.startSession(makeConfig(), makeDeck(3));
      expect(store.score()).toBe(0);
    });

    it('should reset forfeited flag', () => {
      store.startSession(makeConfig(), makeDeck());
      store.endSession();
      expect(store.forfeited()).toBe(true);

      // Start new session
      store.startSession(makeConfig(), makeDeck());
      expect(store.forfeited()).toBe(false);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      store.startSession(makeConfig(), makeDeck());
    });

    it('should return null if not in question status', () => {
      store.startSession(makeConfig(), makeDeck());
      store.submitAnswer('present-simple'); // transitions to result-flash
      const result = store.submitAnswer('present-simple'); // wrong status
      expect(result).toBeNull();
    });

    it('should transition to result-flash status', () => {
      store.submitAnswer('present-simple');
      expect(store.status()).toBe('result-flash');
    });

    it('should record a correct answer', () => {
      const record = store.submitAnswer('present-simple');
      expect(record?.correct).toBe(true);
    });

    it('should record an incorrect answer', () => {
      const record = store.submitAnswer('past-simple');
      expect(record?.correct).toBe(false);
    });

    it('should award points for correct answer', () => {
      store.submitAnswer('present-simple');
      expect(store.score()).toBeGreaterThan(0);
    });

    it('should not award points for incorrect answer', () => {
      store.submitAnswer('past-simple');
      expect(store.score()).toBe(0);
    });

    it('should increment streak on correct answer', () => {
      store.submitAnswer('present-simple');
      expect(store.currentStreak()).toBe(1);
    });

    it('should reset streak on incorrect answer', () => {
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('past-simple');
      expect(store.currentStreak()).toBe(0);
    });

    it('should update lastAnswer', () => {
      const record = store.submitAnswer('present-simple');
      expect(store.lastAnswer()).toEqual(record);
    });

    it('should return the answer record', () => {
      const record = store.submitAnswer('present-simple');
      expect(record).toBeDefined();
      expect(record?.questionId).toBe('q0');
      expect(record?.picked).toBe('present-simple');
    });
  });

  describe('nextQuestion', () => {
    it('should return to question status', () => {
      store.startSession(makeConfig(), makeDeck());
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.status()).toBe('question');
    });

    it('should increment progress index', () => {
      store.startSession(makeConfig(), makeDeck());
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.progress().index).toBe(1);
    });

    it('should load the next question', () => {
      const deck = makeDeck();
      store.startSession(makeConfig(), deck);
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.currentQuestion()).toEqual(deck[1]);
    });

    it('should not transition if not in result-flash status', () => {
      store.startSession(makeConfig(), makeDeck());
      store.nextQuestion(); // wrong status
      expect(store.status()).toBe('question');
    });

    it('should transition to summary when deck is exhausted', () => {
      store.startSession(makeConfig(), makeDeck(2));
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.status()).toBe('summary');
    });

    it('should mark isComplete when all questions answered', () => {
      store.startSession(makeConfig(), makeDeck(2));
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.isComplete()).toBe(true);
    });
  });

  describe('Full session flow', () => {
    it('should complete a 3-question session with all correct answers', () => {
      store.startSession(makeConfig(), makeDeck(3));
      expect(store.status()).toBe('question');

      // Q1: Correct
      store.submitAnswer('present-simple');
      expect(store.status()).toBe('result-flash');
      store.nextQuestion();
      expect(store.progress()).toEqual({ index: 1, total: 3 });

      // Q2: Correct
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.progress()).toEqual({ index: 2, total: 3 });

      // Q3: Correct
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.status()).toBe('summary');
      expect(store.isComplete()).toBe(true);
      expect(store.correctCount()).toBe(3);
      expect(store.accuracy()).toBe(1);
    });

    it('should track accuracy correctly with mixed answers', () => {
      store.startSession(makeConfig(), makeDeck(3));

      // Q1: Correct
      store.submitAnswer('present-simple');
      store.nextQuestion();

      // Q2: Wrong
      store.submitAnswer('past-simple');
      store.nextQuestion();

      // Q3: Correct
      store.submitAnswer('present-simple');
      store.nextQuestion();

      expect(store.correctCount()).toBe(2);
      expect(store.accuracy()).toBe(2 / 3);
    });

    it('should accumulate score across multiple answers', () => {
      store.startSession(makeConfig(), makeDeck(3));

      const scoreAfterQ1 = (() => {
        store.submitAnswer('present-simple');
        return store.score();
      })();
      store.nextQuestion();

      const scoreAfterQ2 = (() => {
        store.submitAnswer('present-simple');
        return store.score();
      })();
      store.nextQuestion();

      store.submitAnswer('present-simple');

      expect(scoreAfterQ1).toBeGreaterThan(0);
      expect(scoreAfterQ2).toBeGreaterThan(scoreAfterQ1);
      expect(store.score()).toBeGreaterThan(scoreAfterQ2);
    });
  });

  describe('Streak tracking', () => {
    it('should track current streak correctly', () => {
      store.startSession(makeConfig(), makeDeck(5));

      // C, C, C
      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.currentStreak()).toBe(1);

      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.currentStreak()).toBe(2);

      store.submitAnswer('present-simple');
      store.nextQuestion();
      expect(store.currentStreak()).toBe(3);

      // W: reset
      store.submitAnswer('wrong-id' as TenseId);
      store.nextQuestion();
      expect(store.currentStreak()).toBe(0);

      // C: new streak
      store.submitAnswer('present-simple');
      expect(store.currentStreak()).toBe(1);
    });

    it('should track best streak correctly', () => {
      store.startSession(makeConfig(), makeDeck(7));

      // First streak: C, C
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();

      // Wrong
      store.submitAnswer('wrong' as TenseId);
      store.nextQuestion();

      // Second streak: C, C, C
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();

      expect(store.bestStreak()).toBe(3);
    });
  });

  describe('timeout', () => {
    it('should record a timeout as incorrect', () => {
      store.startSession(makeConfig(), makeDeck());
      store.timeout();
      expect(store.lastAnswer()?.correct).toBe(false);
    });

    it('should transition to result-flash', () => {
      store.startSession(makeConfig(), makeDeck());
      store.timeout();
      expect(store.status()).toBe('result-flash');
    });

    it('should not award points for timeout', () => {
      store.startSession(makeConfig(), makeDeck());
      store.timeout();
      expect(store.score()).toBe(0);
    });

    it('should set responseMs to windowMs', () => {
      const config = makeConfig();
      store.startSession(config, makeDeck());
      store.timeout();
      expect(store.lastAnswer()?.responseMs).toBe(config.windowMs);
    });
  });

  describe('endSession (forfeit)', () => {
    it('should transition to summary', () => {
      store.startSession(makeConfig(), makeDeck());
      store.endSession();
      expect(store.status()).toBe('summary');
    });

    it('should set forfeited flag', () => {
      store.startSession(makeConfig(), makeDeck());
      store.endSession();
      expect(store.forfeited()).toBe(true);
    });

    it('should clear answers', () => {
      store.startSession(makeConfig(), makeDeck());
      store.submitAnswer('present-simple');
      expect(store.score()).toBeGreaterThan(0);
      store.endSession();
      expect(store.score()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should return to idle status', () => {
      store.startSession(makeConfig(), makeDeck());
      store.reset();
      expect(store.status()).toBe('idle');
    });

    it('should clear all state', () => {
      store.startSession(makeConfig(), makeDeck());
      store.submitAnswer('present-simple');
      store.reset();
      expect(store.currentQuestion()).toBeNull();
      expect(store.score()).toBe(0);
      expect(store.currentStreak()).toBe(0);
    });
  });

  describe('avgResponseMs', () => {
    it('should calculate average response time', () => {
      store.startSession(makeConfig({ windowMs: 5_000 }), makeDeck(3));

      // Mock performance.now() — we can't directly control it,
      // but we can verify it calculates correctly with real timing
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');
      store.nextQuestion();
      store.submitAnswer('present-simple');

      const avg = store.avgResponseMs();
      expect(avg).toBeGreaterThanOrEqual(0);
      expect(avg).toBeLessThanOrEqual(5_000);
    });

    it('should return 0 when no answers', () => {
      store.startSession(makeConfig(), makeDeck());
      expect(store.avgResponseMs()).toBe(0);
    });
  });
});
