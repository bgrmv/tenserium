import { describe, expect, it } from 'vitest';
import { calcPoints } from './scoring';
import type { ScoreInput } from '@shared/types';

const base: ScoreInput = {
  isCorrect: true,
  responseMs: 0,
  windowMs: 10_000,
  streak: 1,
  difficulty: 1,
};

describe('calcPoints', () => {
  it('scores zero for a wrong answer', () => {
    expect(calcPoints({ ...base, isCorrect: false })).toBe(0);
  });

  it('awards base + full speed bonus for an instant correct answer', () => {
    expect(calcPoints(base)).toBe(150);
  });

  it('decays the speed bonus linearly across the window', () => {
    expect(calcPoints({ ...base, responseMs: 5_000 })).toBe(125);
    expect(calcPoints({ ...base, responseMs: 10_000 })).toBe(100);
  });

  it('scales base by difficulty', () => {
    expect(calcPoints({ ...base, responseMs: 10_000, difficulty: 3 })).toBe(300);
  });

  it('applies the streak multiplier and caps it at 5', () => {
    expect(calcPoints({ ...base, responseMs: 10_000, streak: 3 })).toBe(300);
    expect(calcPoints({ ...base, responseMs: 10_000, streak: 99 })).toBe(500);
  });

  it('applies the mode multiplier (e.g. Daily 2×)', () => {
    expect(calcPoints({ ...base, responseMs: 10_000, modeMultiplier: 2 })).toBe(200);
  });

  it('never exceeds the window even if responseMs overshoots', () => {
    expect(calcPoints({ ...base, responseMs: 50_000 })).toBe(100);
  });
});
