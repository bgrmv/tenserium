import { Injectable, computed, inject, signal } from '@angular/core';
import { calcPoints } from '@shared/lib/scoring';
import { getTense } from '@shared/config/tenses.config';
import type {
  AnswerRecord,
  Question,
  SessionConfig,
  SessionStatus,
  TenseId,
} from '@shared/types';
import { StorageService } from '@shared/api/storage.service';

/**
 * GameSessionStore — CQRS signal store for a single play session.
 *
 *  Commands (mutate): startSession, submitAnswer, timeout, nextQuestion, endSession
 *  Queries (computed/read-only): currentQuestion, score, currentStreak, accuracy,
 *  progress, isComplete, lastAnswer
 *
 * State machine: idle → question ⇄ result-flash → … → summary.
 * No direct localStorage — completed sessions persist via StorageService.
 */
@Injectable({ providedIn: 'root' })
export class GameSessionStore {
  private readonly storage = inject(StorageService);

  // ---- state (private writable signals) ----
  private readonly _status = signal<SessionStatus>('idle');
  private readonly _config = signal<SessionConfig | null>(null);
  private readonly _deck = signal<readonly Question[]>([]);
  private readonly _index = signal(0);
  private readonly _answers = signal<readonly AnswerRecord[]>([]);
  private readonly _startedAt = signal(0);
  private readonly _questionShownAt = signal(0);
  private readonly _forfeited = signal(false);

  // ---- queries (public read-only) ----
  readonly status = this._status.asReadonly();
  readonly config = this._config.asReadonly();
  readonly forfeited = this._forfeited.asReadonly();

  readonly currentQuestion = computed<Question | null>(
    () => this._deck()[this._index()] ?? null,
  );

  readonly score = computed(() =>
    this._answers().reduce((sum, a) => sum + a.points, 0),
  );

  readonly currentStreak = computed(() => {
    let streak = 0;
    const answers = this._answers();
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].correct) streak++;
      else break;
    }
    return streak;
  });

  readonly bestStreak = computed(() => {
    let best = 0;
    let run = 0;
    for (const a of this._answers()) {
      run = a.correct ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  });

  readonly correctCount = computed(
    () => this._answers().filter((a) => a.correct).length,
  );

  readonly accuracy = computed(() => {
    const total = this._answers().length;
    return total === 0 ? 1 : this.correctCount() / total;
  });

  readonly progress = computed(() => ({
    index: this._index(),
    total: this._deck().length,
  }));

  readonly isComplete = computed(
    () => this._status() === 'summary',
  );

  readonly lastAnswer = computed<AnswerRecord | null>(
    () => this._answers().at(-1) ?? null,
  );

  readonly avgResponseMs = computed(() => {
    const answers = this._answers();
    if (answers.length === 0) return 0;
    return answers.reduce((s, a) => s + a.responseMs, 0) / answers.length;
  });

  // ---- commands ----
  startSession(config: SessionConfig, deck: readonly Question[]): void {
    this._config.set(config);
    this._deck.set(deck);
    this._index.set(0);
    this._answers.set([]);
    this._forfeited.set(false);
    this._startedAt.set(Date.now());
    this._questionShownAt.set(performance.now());
    this._status.set('question');
  }

  submitAnswer(picked: TenseId): AnswerRecord | null {
    const config = this._config();
    const question = this.currentQuestion();
    if (!config || !question || this._status() !== 'question') return null;

    const responseMs = performance.now() - this._questionShownAt();
    const isCorrect = picked === question.sentences[0].answer;
    const streak = (isCorrect ? this.currentStreak() : 0) + (isCorrect ? 1 : 0);
    const points = calcPoints({
      isCorrect,
      responseMs,
      windowMs: config.windowMs,
      streak,
      difficulty: question.difficulty,
      modeMultiplier: config.modeMultiplier,
    });

    const record: AnswerRecord = {
      questionId: question.id,
      picked,
      correct: isCorrect,
      responseMs,
      points,
    };
    this._answers.update((a) => [...a, record]);
    this._status.set('result-flash');
    return record;
  }

  timeout(): void {
    const question = this.currentQuestion();
    const config = this._config();
    if (!question || !config || this._status() !== 'question') return;
    this._answers.update((a) => [
      ...a,
      {
        questionId: question.id,
        picked: null,
        correct: false,
        responseMs: config.windowMs,
        points: 0,
      },
    ]);
    this._status.set('result-flash');
  }

  nextQuestion(): void {
    if (this._status() !== 'result-flash') return;
    const next = this._index() + 1;
    if (next >= this._deck().length) {
      this.finalise();
      return;
    }
    this._index.set(next);
    this._questionShownAt.set(performance.now());
    this._status.set('question');
  }

  endSession(): void {
    this._forfeited.set(true);
    this._answers.set([]);
    this._status.set('summary');
  }

  reset(): void {
    this._status.set('idle');
    this._deck.set([]);
    this._index.set(0);
    this._answers.set([]);
    this._forfeited.set(false);
  }

  private finalise(): void {
    this._status.set('summary');
    const config = this._config();
    if (!config) return;
    this.storage.save(`session:last`, {
      mode: config.mode,
      score: this.score(),
      accuracy: this.accuracy(),
      bestStreak: this.bestStreak(),
      at: this._startedAt(),
    });
  }

  static aspectOf(id: TenseId) {
    return getTense(id).aspect;
  }
}
