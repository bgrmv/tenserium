import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '@shared/api/storage.service';

export interface DailyResult {
  readonly date: string;
  readonly score: number;
  readonly correct: number;
  readonly total: number;
  readonly accuracy: number;
  /** true = correct, false = wrong/timeout, per question */
  readonly answers: readonly boolean[];
}

interface DailyState {
  lastCompletedDate: string | null;
  streak: number;
  lastResult: DailyResult | null;
}

const STORAGE_KEY = 'daily:state';

const DEFAULT_STATE: DailyState = {
  lastCompletedDate: null,
  streak: 0,
  lastResult: null,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * DailyStore — tracks one-attempt-per-day, streak, and last result.
 * Persisted via StorageService; no backend needed until Phase 9.
 */
@Injectable({ providedIn: 'root' })
export class DailyStore {
  private readonly storage = inject(StorageService);
  private readonly _state = signal<DailyState>(
    this.storage.load<DailyState>(STORAGE_KEY, DEFAULT_STATE),
  );

  readonly today = computed(() => todayStr());

  readonly isDoneToday = computed(
    () => this._state().lastCompletedDate === todayStr(),
  );

  readonly streak = computed(() => this._state().streak);

  readonly lastResult = computed(() => this._state().lastResult);

  readonly todayResult = computed<DailyResult | null>(() =>
    this.isDoneToday() ? this._state().lastResult : null,
  );

  markComplete(result: Omit<DailyResult, 'date'>): void {
    const today = todayStr();
    const prev = this._state();
    const wasYesterday = prev.lastCompletedDate === yesterdayStr();
    const streak = wasYesterday ? prev.streak + 1 : 1;
    this._state.set({
      lastCompletedDate: today,
      streak,
      lastResult: { ...result, date: today },
    });
    this.storage.save(STORAGE_KEY, this._state());
  }
}
