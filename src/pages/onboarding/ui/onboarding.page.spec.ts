import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { OnboardingPageComponent } from './onboarding.page';
import { GameSessionStore } from '@entities/session';
import { UserStore } from '@entities/user';
import { QuestionRepository } from '@entities/question';
import { StorageService } from '@shared/api/storage.service';
import type { Question, TenseId } from '@shared/types';
import { tokenizeSentence } from '@shared/lib/tokenize';

describe('OnboardingPageComponent', () => {
  let component: OnboardingPageComponent;
  let fixture: ComponentFixture<OnboardingPageComponent>;
  let sessionStore: GameSessionStore;
  let userStore: UserStore;
  let questionRepo: QuestionRepository;
  let router: Router;

  function makeQuestion(id: string, answer: TenseId = 'present-simple'): Question {
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

  function makeDeck(n = 5): Question[] {
    return Array.from({ length: n }, (_, i) =>
      makeQuestion(`q${i}`, i % 2 === 0 ? 'present-simple' : 'past-simple'),
    );
  }

  function makeSessionConfig() {
    return {
      mode: 'normal' as const,
      tenses: ['present-simple', 'past-simple'] as TenseId[],
      total: 5,
      windowMs: 12_000,
      modeMultiplier: 1,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPageComponent],
      providers: [
        GameSessionStore,
        UserStore,
        QuestionRepository,
        StorageService,
        provideRouter([]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPageComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(GameSessionStore);
    userStore = TestBed.inject(UserStore);
    questionRepo = TestBed.inject(QuestionRepository);

    router = TestBed.inject(Router);
    vi.spyOn(questionRepo, 'buildDeck').mockReturnValue(makeDeck());
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  // ── Initial state ────────────────────────────────────────────────────

  describe('Initial state', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should start on the demo step', () => {
      expect(component['step']()).toBe('demo');
    });

    it('should have no demo result', () => {
      expect(component['demoResult']()).toBe('none');
    });

    it('should not be demo-answered', () => {
      expect(component['demoAnswered']()).toBe(false);
    });

    it('should have no picked demo answer', () => {
      expect(component['demoPicked']()).toBeNull();
    });

    it('should expose the demo question constant', () => {
      expect(component['DEMO_QUESTION'].sentences[0].answer).toBe('present-simple');
    });
  });

  // ── Demo step — answer handling ──────────────────────────────────────

  describe('Demo step — onDemoAnswer()', () => {
    it('should set demoResult to correct for present-simple', () => {
      component['onDemoAnswer']('present-simple');
      expect(component['demoResult']()).toBe('correct');
    });

    it('should set demoResult to wrong for any other tense', () => {
      component['onDemoAnswer']('past-simple');
      expect(component['demoResult']()).toBe('wrong');

      component['demoResult'].set('none');
      component['demoPicked'].set(null);
      component['onDemoAnswer']('future-perfect');
      expect(component['demoResult']()).toBe('wrong');
    });

    it('should record the tense that was picked', () => {
      component['onDemoAnswer']('past-perfect');
      expect(component['demoPicked']()).toBe('past-perfect');
    });

    it('should guard against answering a second time', () => {
      component['onDemoAnswer']('present-simple');
      component['onDemoAnswer']('past-simple');
      expect(component['demoPicked']()).toBe('present-simple');
      expect(component['demoResult']()).toBe('correct');
    });

    it('should set demoAnswered after the correct-flash delay (700 ms)', () => {
      vi.useFakeTimers();
      component['onDemoAnswer']('present-simple');

      expect(component['demoAnswered']()).toBe(false);
      vi.advanceTimersByTime(699);
      expect(component['demoAnswered']()).toBe(false);
      vi.advanceTimersByTime(1);
      expect(component['demoAnswered']()).toBe(true);

      vi.useRealTimers();
    });

    it('should set demoAnswered after the wrong-flash delay (1050 ms)', () => {
      vi.useFakeTimers();
      component['onDemoAnswer']('past-simple');

      expect(component['demoAnswered']()).toBe(false);
      vi.advanceTimersByTime(1049);
      expect(component['demoAnswered']()).toBe(false);
      vi.advanceTimersByTime(1);
      expect(component['demoAnswered']()).toBe(true);

      vi.useRealTimers();
    });
  });

  // ── Demo step — step transition ──────────────────────────────────────

  describe('Demo step — startGame()', () => {
    it('should transition to the game step', () => {
      component['startGame']();
      expect(component['step']()).toBe('game');
    });
  });

  // ── Game step — answer handling ──────────────────────────────────────

  describe('Game step — onAnswer()', () => {
    beforeEach(() => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
    });

    it('should record a correct answer in the store', () => {
      component['onAnswer']('present-simple');
      expect(sessionStore.status()).toBe('result-flash');
      expect(sessionStore.lastAnswer()?.correct).toBe(true);
    });

    it('should record an incorrect answer in the store', () => {
      component['onAnswer']('future-perfect');
      expect(sessionStore.status()).toBe('result-flash');
      expect(sessionStore.lastAnswer()?.correct).toBe(false);
    });

    it('should set result to correct', () => {
      component['onAnswer']('present-simple');
      expect(component['result']()).toBe('correct');
    });

    it('should set result to wrong', () => {
      component['onAnswer']('future-perfect');
      expect(component['result']()).toBe('wrong');
    });

    it('should record the picked tense', () => {
      component['onAnswer']('present-simple');
      expect(component['pickedId']()).toBe('present-simple');
    });

    it('should reveal the correct tense', () => {
      component['onAnswer']('present-simple');
      expect(component['revealId']()).toBe('present-simple');
    });

    it('should set gained points for a correct answer', () => {
      component['onAnswer']('present-simple');
      expect(component['gained']()).toBeGreaterThan(0);
    });

    it('should not set gained for an incorrect answer', () => {
      component['onAnswer']('future-perfect');
      expect(component['gained']()).toBeNull();
    });

    it('should award score for a correct answer', () => {
      component['onAnswer']('present-simple');
      expect(sessionStore.score()).toBeGreaterThan(0);
    });

    it('should not award score for an incorrect answer', () => {
      component['onAnswer']('future-perfect');
      expect(sessionStore.score()).toBe(0);
    });

    it('should stop the timer when answering', () => {
      const spy = vi.spyOn(component['timer'], 'stop');
      component['onAnswer']('present-simple');
      expect(spy).toHaveBeenCalled();
    });

    it('should guard against answering twice', () => {
      component['onAnswer']('present-simple');
      const scoreAfterFirst = sessionStore.score();
      component['onAnswer']('past-simple');
      expect(sessionStore.score()).toBe(scoreAfterFirst);
    });

    it('should guard against answering outside question status', () => {
      // Exhaust all questions through the store
      for (let i = 0; i < 5; i++) {
        sessionStore.submitAnswer('present-simple');
        sessionStore.nextQuestion();
      }
      expect(sessionStore.status()).toBe('summary');

      const count = sessionStore['_answers']().length;
      component['result'].set('none');
      component['onAnswer']('present-simple');
      expect(sessionStore['_answers']().length).toBe(count);
    });
  });

  // ── Game step — timeout ──────────────────────────────────────────────

  describe('Game step — onTimeout()', () => {
    beforeEach(() => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
    });

    it('should set result to timeout', () => {
      component['onTimeout']();
      expect(component['result']()).toBe('timeout');
    });

    it('should transition the store to result-flash', () => {
      component['onTimeout']();
      expect(sessionStore.status()).toBe('result-flash');
    });

    it('should reveal the correct answer tense', () => {
      component['onTimeout']();
      expect(component['revealId']()).toBe('present-simple');
    });

    it('should not award points for a timeout', () => {
      component['onTimeout']();
      expect(sessionStore.score()).toBe(0);
    });

    it('should ignore a timeout if a result is already showing', () => {
      component['onAnswer']('present-simple');
      const count = sessionStore['_answers']().length;
      component['onTimeout']();
      expect(sessionStore['_answers']().length).toBe(count);
    });
  });

  // ── Game step — question progression ────────────────────────────────

  describe('Game step — question progression', () => {
    it('should start with the first question at index 0', () => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
      expect(sessionStore.currentQuestion()?.id).toBe('q0');
      expect(sessionStore.progress().index).toBe(0);
    });

    it('should advance to save-prompt after the last question via scheduleNext', () => {
      vi.useFakeTimers();
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());

      // Complete first 4 questions directly through the store
      for (let i = 0; i < 4; i++) {
        sessionStore.submitAnswer('present-simple');
        sessionStore.nextQuestion();
      }
      expect(sessionStore.progress().index).toBe(4);

      // Answer the 5th question through the component (queues a setTimeout)
      component['onAnswer']('present-simple');
      expect(component['step']()).toBe('game');

      // Fire the timeout → scheduleNext detects summary → sets step
      vi.advanceTimersByTime(700);
      expect(component['step']()).toBe('save-prompt');

      vi.useRealTimers();
    });

    it('should clear result state between questions via scheduleNext', () => {
      vi.useFakeTimers();
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());

      component['onAnswer']('present-simple');
      expect(component['result']()).toBe('correct');

      vi.advanceTimersByTime(700);
      // After flash the result must reset (store is on q1, not summary yet)
      expect(component['result']()).toBe('none');
      expect(component['pickedId']()).toBeNull();
      expect(component['revealId']()).toBeNull();
      expect(component['gained']()).toBeNull();

      vi.useRealTimers();
    });
  });

  // ── Score accumulation ───────────────────────────────────────────────

  describe('Game step — score accumulation', () => {
    beforeEach(() => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
    });

    it('should increase score with each correct answer', () => {
      sessionStore.submitAnswer('present-simple');
      const s1 = sessionStore.score();
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('past-simple');
      const s2 = sessionStore.score();
      expect(s2).toBeGreaterThan(s1);
    });

    it('should not increase score for an incorrect answer', () => {
      sessionStore.submitAnswer('present-simple');
      const correct = sessionStore.score();
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('wrong-id' as TenseId);
      expect(sessionStore.score()).toBe(correct);
    });
  });

  // ── Streak ───────────────────────────────────────────────────────────

  describe('Game step — streak', () => {
    beforeEach(() => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
    });

    it('should increment streak on consecutive correct answers', () => {
      sessionStore.submitAnswer('present-simple');
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(1);
      sessionStore.submitAnswer('past-simple');
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(2);
    });

    it('should reset streak after a wrong answer', () => {
      // Use a uniform deck so all correct answers are 'present-simple'
      const uniform = Array.from({ length: 5 }, (_, i) => makeQuestion(`u${i}`, 'present-simple'));
      sessionStore.startSession(makeSessionConfig(), uniform);

      sessionStore.submitAnswer('present-simple'); // correct
      sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple'); // correct
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(2);

      sessionStore.submitAnswer('wrong-id' as TenseId); // wrong → resets streak
      sessionStore.nextQuestion();
      expect(sessionStore.currentStreak()).toBe(0);
    });
  });

  // ── inferredLevel ────────────────────────────────────────────────────

  describe('inferredLevel()', () => {
    function startAndAnswer(correctCount: number): void {
      const deck = makeDeck(5);
      sessionStore.startSession(makeSessionConfig(), deck);
      for (let i = 0; i < 5; i++) {
        const answer = i < correctCount ? deck[i].sentences[0].answer : ('wrong-id' as TenseId);
        sessionStore.submitAnswer(answer);
        if (i < 4) sessionStore.nextQuestion();
      }
    }

    it('should return Продвинутый for >= 80% accuracy (5/5 = 100%)', () => {
      startAndAnswer(5);
      expect(component['inferredLevel']()).toBe('Продвинутый');
    });

    it('should return Продвинутый for exactly 80% accuracy (4/5)', () => {
      startAndAnswer(4);
      expect(component['inferredLevel']()).toBe('Продвинутый');
    });

    it('should return Средний for 60% accuracy (3/5)', () => {
      startAndAnswer(3);
      expect(component['inferredLevel']()).toBe('Средний');
    });

    it('should return Средний for exactly 50% accuracy (but not below)', () => {
      // accuracy() = 0.5 when none answered yet after 0 answers → 1 (default)
      // Force exactly 50%: need even number of answers; with 5 total can't get exact 50%
      // Use the store directly: 2/4 answers = 50%
      const deck = Array.from({ length: 4 }, (_, i) => makeQuestion(`q${i}`));
      sessionStore.startSession({ ...makeSessionConfig(), total: 4 }, deck);
      sessionStore.submitAnswer('present-simple'); sessionStore.nextQuestion();
      sessionStore.submitAnswer('present-simple'); sessionStore.nextQuestion();
      sessionStore.submitAnswer('wrong-id' as TenseId); sessionStore.nextQuestion();
      sessionStore.submitAnswer('wrong-id' as TenseId);
      expect(sessionStore.accuracy()).toBeCloseTo(0.5, 5);
      expect(component['inferredLevel']()).toBe('Средний');
    });

    it('should return Начинающий for < 50% accuracy (1/5 = 20%)', () => {
      startAndAnswer(1);
      expect(component['inferredLevel']()).toBe('Начинающий');
    });

    it('should return Начинающий for 0% accuracy (0/5)', () => {
      startAndAnswer(0);
      expect(component['inferredLevel']()).toBe('Начинающий');
    });
  });

  // ── Save-prompt ──────────────────────────────────────────────────────

  describe('Save-prompt — continueWithout()', () => {
    it('should call markOnboardingSeen()', () => {
      const spy = vi.spyOn(userStore, 'markOnboardingSeen');
      component['continueWithout']();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should reset the session store to idle', () => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
      sessionStore.submitAnswer('present-simple');
      expect(sessionStore.score()).toBeGreaterThan(0);

      component['continueWithout']();
      expect(sessionStore.status()).toBe('idle');
      expect(sessionStore.score()).toBe(0);
    });

    it('should navigate to /home', () => {
      component['continueWithout']();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('Save-prompt — createAccount()', () => {
    it('should mark onboarding as seen', () => {
      const spy = vi.spyOn(userStore, 'markOnboardingSeen');
      component['createAccount']();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should navigate to /home', () => {
      component['createAccount']();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  // ── Skip ─────────────────────────────────────────────────────────────

  describe('skip()', () => {
    it('should call markOnboardingSeen()', () => {
      const spy = vi.spyOn(userStore, 'markOnboardingSeen');
      component['skip']();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should navigate to /home', () => {
      component['skip']();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should stop the timer before navigating', () => {
      const spy = vi.spyOn(component['timer'], 'stop');
      component['skip']();
      expect(spy).toHaveBeenCalled();
    });

    it('should work from the demo step', () => {
      expect(component['step']()).toBe('demo');
      component['skip']();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should work from the game step mid-session', () => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
      sessionStore.submitAnswer('present-simple');
      expect(sessionStore.score()).toBeGreaterThan(0);

      component['skip']();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(sessionStore.status()).toBe('idle');
    });
  });

  // ── Computed view props ──────────────────────────────────────────────

  describe('revealColor / revealName computed signals', () => {
    beforeEach(() => {
      component['step'].set('game');
      sessionStore.startSession(makeSessionConfig(), makeDeck());
    });

    it('should return null revealName when no reveal', () => {
      expect(component['revealName']()).toBeNull();
    });

    it('should return the tense name after an answer', () => {
      component['onAnswer']('present-simple');
      expect(component['revealName']()).toBe('Present Simple');
    });

    it('should return the tense name after a wrong answer (reveals correct)', () => {
      component['onAnswer']('future-perfect');
      // First question answer is 'present-simple'
      expect(component['revealName']()).toBe('Present Simple');
    });
  });
});
