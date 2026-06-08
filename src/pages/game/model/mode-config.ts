import type { Aspect, SessionMode, TenseId } from '@shared/types';
import { TENSES } from '@shared/config/tenses.config';

export interface ModeConfig {
  readonly title: string;
  readonly tag: string;
  readonly bots: boolean;
  readonly lock: boolean;
  readonly total: number;
  readonly windowMs: number;
  readonly modeMultiplier: number;
  readonly focusAspect?: Aspect;
}

export const QUESTION_WINDOW_MS = 10_000;

export const UNLOCK_AT = 600;

export const MODE_CONFIG: Record<SessionMode, ModeConfig> = {
  normal: { title: 'Practice', tag: 'Normal Mode', bots: false, lock: false, total: 12, windowMs: QUESTION_WINDOW_MS, modeMultiplier: 1 },
  rank: { title: 'Ranked Run', tag: 'Rank Mode', bots: true, lock: true, total: 12, windowMs: QUESTION_WINDOW_MS, modeMultiplier: 1 },
  squad: { title: 'Squad Battle', tag: 'Rank Mode', bots: true, lock: true, total: 12, windowMs: QUESTION_WINDOW_MS, modeMultiplier: 1 },
  daily: { title: 'Daily Challenge', tag: '2× Points', bots: false, lock: false, total: 10, windowMs: QUESTION_WINDOW_MS, modeMultiplier: 2, focusAspect: 'perfect' },
};

const STARTER_TENSES: readonly TenseId[] = TENSES.filter(
  (t) => t.aspect !== 'perfect-continuous',
).map((t) => t.id);

const ALL_TENSES: readonly TenseId[] = TENSES.map((t) => t.id);
const LOCKED_TENSES: readonly TenseId[] = TENSES.filter(
  (t) => t.aspect === 'perfect-continuous',
).map((t) => t.id);

export function poolFor(config: ModeConfig): readonly TenseId[] {
  return config.lock ? STARTER_TENSES : ALL_TENSES;
}

export function lockedFor(config: ModeConfig, unlocked: boolean): readonly TenseId[] {
  return config.lock && !unlocked ? LOCKED_TENSES : [];
}
