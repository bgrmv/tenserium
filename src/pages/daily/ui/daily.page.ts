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
import { DailyStore } from '@entities/daily';
import { QuestionRepository } from '@entities/question';
import { getTense } from '@shared/config/tenses.config';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import { AnswerGridComponent } from '@features/answer-input';
import { ReportErrorComponent } from '@features/report-error';
import { DailyShareComponent } from '@features/daily-share';
import { QuestionCardComponent, type ResultState } from '@widgets/question-card';
import { ScoreBarComponent } from '@widgets/score-bar';
import { SessionSummaryComponent } from '@widgets/session-summary';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { createGameTimer } from '@shared/lib/game-timer';

const FLASH_CORRECT_MS = 700;
const FLASH_WRONG_MS = 1050;
const DAILY_TOTAL = 15;
const DAILY_WINDOW_MS = 10_000;
const DAILY_MULTIPLIER = 2;

@Component({
  selector: 'app-daily-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnswerGridComponent,
    ReportErrorComponent,
    DailyShareComponent,
    QuestionCardComponent,
    ScoreBarComponent,
    SessionSummaryComponent,
    IconComponent,
  ],
  templateUrl: './daily.page.html',
  styleUrl: './daily.page.css',
})
export class DailyPageComponent {
  private readonly store = inject(GameSessionStore);
  private readonly daily = inject(DailyStore);
  private readonly repo = inject(QuestionRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly result = signal<ResultState>('none');
  protected readonly pickedId = signal<TenseId | null>(null);
  protected readonly revealId = signal<TenseId | null>(null);
  protected readonly gained = signal<number | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly showReport = signal(false);

  protected readonly status = this.store.status;
  protected readonly forfeited = this.store.forfeited;
  protected readonly question = this.store.currentQuestion;
  protected readonly score = this.store.score;
  protected readonly combo = this.store.currentStreak;
  protected readonly progress = this.store.progress;
  protected readonly isLoading = this.repo.isLoading;

  protected readonly isDoneToday = this.daily.isDoneToday;
  protected readonly todayResult = this.daily.todayResult;
  protected readonly streak = this.daily.streak;
  protected readonly today = this.daily.today;

  protected readonly revealColor = computed(() => {
    const id = this.revealId();
    return id ? tenseColor(getTense(id), 'aspect') : 'var(--accent)';
  });

  protected readonly revealName = computed(() => {
    const id = this.revealId();
    return id ? getTense(id).name : null;
  });

  protected readonly summaryProps = computed(() => ({
    correct: this.store.correctCount(),
    accuracy: this.store.accuracy(),
    bestStreak: this.store.bestStreak(),
    total: DAILY_TOTAL,
  }));

  private readonly timer = createGameTimer(DAILY_WINDOW_MS, () => this.onTimeout());
  protected readonly remainingMs = this.timer.remainingMs;
  protected readonly fraction = this.timer.fraction;

  private started = false;
  private answersLog: boolean[] = [];

  constructor() {
    // Load all tenses for the daily deck
    this.repo.tenseIds.set(TENSES.map((t) => t.id));

    effect(() => {
      if (this.repo.questions.hasValue() && !this.started && !this.isDoneToday()) {
        untracked(() => this.begin());
      }
    });

    this.destroyRef.onDestroy(() => this.timer.stop());
  }

  private begin(): void {
    this.started = true;
    this.answersLog = [];
    const deck = this.repo.buildDailyDeck(this.today(), DAILY_TOTAL);
    this.store.startSession(
      {
        mode: 'daily',
        tenses: TENSES.map((t) => t.id),
        total: deck.length,
        windowMs: DAILY_WINDOW_MS,
        modeMultiplier: DAILY_MULTIPLIER,
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

    this.answersLog.push(record.correct);
    this.pickedId.set(id);
    this.revealId.set(this.question()?.answer ?? null);
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
    this.answersLog.push(false);
    this.revealId.set(this.question()?.answer ?? null);
    this.result.set('timeout');
    this.scheduleNext(FLASH_WRONG_MS);
  }

  protected endSession(): void {
    this.timer.stop();
    this.store.endSession();
  }

  protected exit(): void {
    this.store.reset();
    void this.router.navigate(['/home']);
  }

  protected studyTense(id: TenseId): void {
    this.store.reset();
    void this.router.navigate(['/learn', id]);
  }

  protected onReportSent(): void {
    this.showReport.set(false);
    this.toast.set('Thanks for the report!');
    setTimeout(() => this.toast.set(null), 2600);
  }

  private scheduleNext(delay: number): void {
    setTimeout(() => {
      this.result.set('none');
      this.pickedId.set(null);
      this.revealId.set(null);
      this.gained.set(null);

      this.store.nextQuestion();
      if (this.store.status() === 'summary') {
        this.finishDaily();
        return;
      }
      this.timer.start();
    }, delay);
  }

  private finishDaily(): void {
    if (!this.store.forfeited()) {
      this.daily.markComplete({
        score: this.store.score(),
        correct: this.store.correctCount(),
        total: this.store.progress().total,
        accuracy: this.store.accuracy(),
        answers: [...this.answersLog],
      });
    }
  }
}
