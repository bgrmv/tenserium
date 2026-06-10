import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionStore } from '@entities/session';
import { UserStore } from '@entities/user';
import { QuestionRepository } from '@entities/question';
import { getTense } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { Question, TenseId } from '@shared/types';
import { AnswerGridComponent } from '@features/answer-input';
import { QuestionCardComponent, type ResultState } from '@widgets/question-card';
import { ScoreBarComponent } from '@widgets/score-bar';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { createGameTimer } from '@shared/lib/game-timer';

type OnboardingStep = 'demo' | 'game' | 'save-prompt';

const DEMO_QUESTION: Question = {
  id: 'demo-1',
  mechanism: 'context',
  prompt: { ru: 'She always drinks tea in the morning.', en: 'She always drinks tea in the morning.' },
  sentences: [
    { pre: 'She always ', verb: 'drinks', post: ' tea in the morning.', answer: 'present-simple' },
  ],
  tags: ['present-simple', 'affirmative', 'simple'],
  difficulty: 1,
};

const ONBOARDING_TENSES: readonly TenseId[] = ['present-simple', 'past-simple'];
const ONBOARDING_TOTAL = 5;
const WINDOW_MS = 12_000;
const FLASH_CORRECT_MS = 700;
const FLASH_WRONG_MS = 1050;

@Component({
  selector: 'app-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnswerGridComponent,
    QuestionCardComponent,
    ScoreBarComponent,
    IconComponent,
    LogoComponent,
  ],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.css',
})
export class OnboardingPageComponent {
  private readonly store = inject(GameSessionStore);
  private readonly user = inject(UserStore);
  private readonly repo = inject(QuestionRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly step = signal<OnboardingStep>('demo');

  // ── Demo step ────────────────────────────────────────────────────────
  protected readonly demoResult = signal<ResultState>('none');
  protected readonly demoPicked = signal<TenseId | null>(null);
  protected readonly demoAnswered = signal(false);
  protected readonly DEMO_QUESTION = DEMO_QUESTION;

  protected readonly demoRevealColor = computed(() =>
    tenseColor(getTense('present-simple'), 'aspect'),
  );

  // ── Game step ────────────────────────────────────────────────────────
  protected readonly result = signal<ResultState>('none');
  protected readonly pickedId = signal<TenseId | null>(null);
  protected readonly revealId = signal<TenseId | null>(null);
  protected readonly gained = signal<number | null>(null);
  protected readonly isLoading = this.repo.isLoading;

  protected readonly status = this.store.status;
  protected readonly question = this.store.currentQuestion;
  protected readonly score = this.store.score;
  protected readonly combo = this.store.currentStreak;
  protected readonly progress = this.store.progress;

  protected readonly revealColor = computed(() => {
    const id = this.revealId();
    return id ? tenseColor(getTense(id), 'aspect') : 'var(--accent)';
  });
  protected readonly revealName = computed(() => {
    const id = this.revealId();
    return id ? getTense(id).name : null;
  });

  // ── Save-prompt ──────────────────────────────────────────────────────
  protected readonly inferredLevel = computed(() => {
    const acc = this.store.accuracy();
    if (acc >= 0.8) return 'Продвинутый';
    if (acc >= 0.5) return 'Средний';
    return 'Начинающий';
  });

  private readonly timer = createGameTimer(WINDOW_MS, () => this.onTimeout());
  protected readonly remainingMs = this.timer.remainingMs;
  protected readonly fraction = this.timer.fraction;

  private gameStarted = false;

  constructor() {
    effect(() => {
      if (this.step() === 'game') {
        untracked(() => this.repo.tenseIds.set(ONBOARDING_TENSES));
      }
    });

    effect(() => {
      const inGame = this.step() === 'game';
      const loaded = this.repo.questions.hasValue();
      if (inGame && loaded && !this.gameStarted) {
        untracked(() => this.beginGame());
      }
    });

    this.destroyRef.onDestroy(() => this.timer.stop());
  }

  // ── Demo handlers ────────────────────────────────────────────────────

  protected onDemoAnswer(id: TenseId): void {
    if (this.demoResult() !== 'none') return;
    this.demoPicked.set(id);
    const correct = id === 'present-simple';
    this.demoResult.set(correct ? 'correct' : 'wrong');
    setTimeout(() => this.demoAnswered.set(true), correct ? FLASH_CORRECT_MS : FLASH_WRONG_MS);
  }

  protected startGame(): void {
    this.step.set('game');
  }

  // ── Game handlers ────────────────────────────────────────────────────

  private beginGame(): void {
    this.gameStarted = true;
    const deck = this.repo.buildDeck({
      mode: 'normal',
      tenses: ONBOARDING_TENSES,
      total: ONBOARDING_TOTAL,
      windowMs: WINDOW_MS,
      modeMultiplier: 1,
    });
    this.store.startSession(
      {
        mode: 'normal',
        tenses: ONBOARDING_TENSES,
        total: deck.length,
        windowMs: WINDOW_MS,
        modeMultiplier: 1,
      },
      deck,
    );
    this.timer.start();
  }

  protected onAnswer(id: TenseId): void {
    if (this.result() !== 'none' || this.status() !== 'question') return;
    this.timer.stop();
    const record = this.store.submitAnswer(id);
    if (!record) return;

    this.pickedId.set(id);
    this.revealId.set(this.question()?.sentences[0].answer ?? null);
    if (record.correct) {
      this.result.set('correct');
      this.gained.set(record.points);
      this.scheduleNext(FLASH_CORRECT_MS);
    } else {
      this.result.set('wrong');
      this.scheduleNext(FLASH_WRONG_MS);
    }
  }

  private onTimeout(): void {
    if (this.result() !== 'none') return;
    this.store.timeout();
    this.revealId.set(this.question()?.sentences[0].answer ?? null);
    this.result.set('timeout');
    this.scheduleNext(FLASH_WRONG_MS);
  }

  private scheduleNext(delay: number): void {
    setTimeout(() => {
      this.result.set('none');
      this.pickedId.set(null);
      this.revealId.set(null);
      this.gained.set(null);
      this.store.nextQuestion();
      if (this.store.status() === 'summary') {
        this.step.set('save-prompt');
        return;
      }
      this.timer.start();
    }, delay);
  }

  protected skip(): void {
    this.timer.stop();
    this.continueWithout();
  }

  // ── Save-prompt handlers ─────────────────────────────────────────────

  protected continueWithout(): void {
    this.user.markOnboardingSeen();
    this.store.reset();
    void this.router.navigate(['/home']);
  }

  protected createAccount(): void {
    // Phase 8: Supabase Auth. Until then behaves as "continue without".
    this.continueWithout();
  }
}
