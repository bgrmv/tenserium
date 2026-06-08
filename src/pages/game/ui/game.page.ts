import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionStore } from '@entities/session';
import { MatchStore } from '@entities/match';
import { UserStore } from '@entities/user';
import { QuestionRepository } from '@entities/question';
import { getTense } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { SessionMode, TenseId } from '@shared/types';
import { AnswerGridComponent } from '@features/answer-input';
import { QuestionCardComponent, type ResultState } from '@widgets/question-card';
import { ScoreBarComponent } from '@widgets/score-bar';
import { SquadBoardComponent } from '@widgets/squad-board';
import { SessionSummaryComponent } from '@widgets/session-summary';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { createGameTimer } from '@shared/lib/game-timer';
import { MODE_CONFIG, UNLOCK_AT, lockedFor, poolFor } from '../model/mode-config';

const FLASH_CORRECT_MS = 700;
const FLASH_WRONG_MS = 1050;
const BOT_TICK_MS = 200;

@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnswerGridComponent,
    QuestionCardComponent,
    ScoreBarComponent,
    SquadBoardComponent,
    SessionSummaryComponent,
    IconComponent,
  ],
  templateUrl: './game.page.html',
  styleUrl: './game.page.css',
})
export class GamePageComponent {
  readonly mode = input<SessionMode>('normal');
  readonly palette = input<PaletteMode>('aspect');

  private readonly store = inject(GameSessionStore);
  private readonly match = inject(MatchStore);
  private readonly user = inject(UserStore);
  private readonly repo = inject(QuestionRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cfg = computed(() => MODE_CONFIG[this.mode()]);

  protected readonly result = signal<ResultState>('none');
  protected readonly pickedId = signal<TenseId | null>(null);
  protected readonly revealId = signal<TenseId | null>(null);
  protected readonly gained = signal<number | null>(null);
  protected readonly toast = signal<string | null>(null);
  private readonly unlocked = signal(false);

  protected readonly status = this.store.status;
  protected readonly forfeited = this.store.forfeited;
  protected readonly question = this.store.currentQuestion;
  protected readonly score = this.store.score;
  protected readonly combo = this.store.currentStreak;
  protected readonly progress = this.store.progress;
  protected readonly leaderboard = this.match.leaderboard;
  protected readonly place = this.match.playerPlace;
  protected readonly isLoading = this.repo.isLoading;

  protected readonly lockedIds = computed(() =>
    lockedFor(this.cfg(), this.unlocked()),
  );

  protected readonly revealColor = computed(() => {
    const id = this.revealId();
    return id ? tenseColor(getTense(id), this.palette()) : 'var(--accent)';
  });

  protected readonly revealName = computed(() => {
    const id = this.revealId();
    return id ? getTense(id).name : null;
  });

  private readonly timer = createGameTimer(MODE_CONFIG[this.mode()].windowMs, () =>
    this.onTimeout(),
  );
  protected readonly remainingMs = this.timer.remainingMs;
  protected readonly fraction = this.timer.fraction;

  private started = false;
  private botInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const pool = poolFor(this.cfg());
      untracked(() => this.repo.tenseIds.set(pool));
    });

    effect(() => {
      if (this.repo.questions.hasValue() && !this.started) {
        untracked(() => this.begin());
      }
    });

    this.destroyRef.onDestroy(() => {
      this.timer.stop();
      if (this.botInterval) clearInterval(this.botInterval);
    });
  }

  private begin(): void {
    this.started = true;
    const cfg = this.cfg();
    const deck = this.repo.buildDeck({
      mode: this.mode(),
      tenses: poolFor(cfg),
      total: cfg.total,
      windowMs: cfg.windowMs,
      modeMultiplier: cfg.modeMultiplier,
      focusAspect: cfg.focusAspect,
    });
    this.store.startSession(
      {
        mode: this.mode(),
        tenses: poolFor(cfg),
        total: deck.length,
        windowMs: cfg.windowMs,
        modeMultiplier: cfg.modeMultiplier,
        focusAspect: cfg.focusAspect,
      },
      deck,
    );
    this.timer.start();

    if (cfg.bots) {
      this.match.start(deck.length, this.user.profile().nickname.split(' ')[0]);
      this.botInterval = setInterval(() => {
        this.match.tick(BOT_TICK_MS / 1000);
        this.match.syncPlayer(this.store.score(), this.progress().index);
      }, BOT_TICK_MS);
    }
  }

  protected onAnswer(id: TenseId): void {
    if (this.result() !== 'none' || this.status() !== 'question') return;
    this.timer.stop();
    const record = this.store.submitAnswer(id);
    if (!record) return;

    this.pickedId.set(id);
    this.revealId.set(this.question()?.answer ?? null);
    if (record.correct) {
      this.result.set('correct');
      this.gained.set(record.points);
      this.maybeUnlock();
      this.scheduleNext(FLASH_CORRECT_MS);
    } else {
      this.result.set('wrong');
      this.scheduleNext(FLASH_WRONG_MS);
    }
  }

  private onTimeout(): void {
    if (this.result() !== 'none') return;
    this.store.timeout();
    this.revealId.set(this.question()?.answer ?? null);
    this.result.set('timeout');
    this.scheduleNext(FLASH_WRONG_MS);
  }

  protected endSession(): void {
    this.timer.stop();
    if (this.botInterval) clearInterval(this.botInterval);
    this.store.endSession();
  }

  protected playAgain(): void {
    this.store.reset();
    this.started = false;
    this.unlocked.set(false);
    this.result.set('none');
    this.begin();
  }

  protected exit(): void {
    this.store.reset();
    void this.router.navigate(['/home']);
  }

  private scheduleNext(delay: number): void {
    setTimeout(() => {
      this.result.set('none');
      this.pickedId.set(null);
      this.revealId.set(null);
      this.gained.set(null);

      this.store.nextQuestion();
      if (this.store.status() === 'summary') {
        this.finishMatch();
        return;
      }
      this.timer.start();
    }, delay);
  }

  private finishMatch(): void {
    if (this.botInterval) clearInterval(this.botInterval);
    const cfg = this.cfg();
    if (!this.store.forfeited() && (this.mode() === 'rank' || this.mode() === 'squad')) {
      this.user.awardRankPoints(Math.round(this.store.score() / 12));
    }
    if (cfg.bots) this.match.syncPlayer(this.store.score(), this.progress().total);
  }

  private maybeUnlock(): void {
    if (this.cfg().lock && !this.unlocked() && this.store.score() >= UNLOCK_AT) {
      this.unlocked.set(true);
      this.toast.set('Perfect Continuous unlocked!');
      setTimeout(() => this.toast.set(null), 2600);
    }
  }

  protected readonly summaryProps = computed(() => ({
    correct: this.store.correctCount(),
    accuracy: this.store.accuracy(),
    bestStreak: this.store.bestStreak(),
    total: this.store.config()?.total ?? this.cfg().total,
  }));
}
