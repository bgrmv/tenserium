import type { ScoreInput } from '@shared/types';

const BASE_PER_DIFFICULTY = 100;
const MAX_SPEED_BONUS = 50;
const MAX_STREAK_MULTIPLIER = 5;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Per-answer score.
 *  base   = 100 × difficulty
 *  speed  = linear decay 0…50 across the answer window (faster = more)
 *  streak = ×1…×5, capped (consecutive correct, including this answer)
 * Wrong answers score 0 and reset the streak (handled by the caller).
 */
export function calcPoints(input: ScoreInput): number {
  if (!input.isCorrect) return 0;

  const base = BASE_PER_DIFFICULTY * input.difficulty;
  const remaining = 1 - clamp01(input.responseMs / input.windowMs);
  const speedBonus = Math.round(MAX_SPEED_BONUS * remaining);
  const streakMultiplier = Math.max(1, Math.min(input.streak, MAX_STREAK_MULTIPLIER));
  const modeMultiplier = input.modeMultiplier ?? 1;

  return Math.round((base + speedBonus) * streakMultiplier * modeMultiplier);
}
