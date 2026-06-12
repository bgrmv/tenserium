import { describe, expect, it } from 'vitest';
import type { Question, SessionConfig, TenseId } from '@shared/types';
import { tokenizeSentence } from '@shared/lib/tokenize';
import { buildDailyDeckFrom, buildDeckFrom } from './deck';

function makeQuestion(id: string, answer: TenseId): Question {
  return {
    id,
    mechanism: 'context',
    prompt: { en: 'prompt', ru: 'подсказка' },
    sentences: [{ tokens: tokenizeSentence('I ', 'play', ' football.'), answer }],
    tags: [],
    difficulty: 1,
  };
}

function makePool(perTense: number, tenses: readonly TenseId[]): Question[] {
  return tenses.flatMap((t) =>
    Array.from({ length: perTense }, (_, i) => makeQuestion(`${t}-${String(i + 1).padStart(2, '0')}`, t)),
  );
}

const config = (overrides: Partial<SessionConfig> = {}): SessionConfig => ({
  mode: 'normal',
  tenses: ['present-simple', 'past-simple'],
  total: 10,
  windowMs: 10_000,
  modeMultiplier: 1,
  ...overrides,
});

describe('buildDeckFrom', () => {
  const pool = makePool(10, ['present-simple', 'past-simple', 'future-simple']);

  it('never repeats a question within a deck', () => {
    for (let run = 0; run < 50; run++) {
      const deck = buildDeckFrom(pool, config({ total: 20 }));
      expect(new Set(deck.map((q) => q.id)).size).toBe(deck.length);
    }
  });

  it('only includes questions from the configured tenses', () => {
    const deck = buildDeckFrom(pool, config());
    for (const q of deck) {
      expect(['present-simple', 'past-simple']).toContain(q.sentences[0].answer);
    }
  });

  it('is capped by the available pool', () => {
    const deck = buildDeckFrom(pool, config({ total: 100 }));
    expect(deck.length).toBe(20);
  });

  it('avoids consecutive same-tense questions while alternatives exist', () => {
    for (let run = 0; run < 50; run++) {
      const deck = buildDeckFrom(pool, config({ total: 10 }));
      for (let i = 1; i < deck.length; i++) {
        expect(deck[i].sentences[0].answer).not.toBe(deck[i - 1].sentences[0].answer);
      }
    }
  });

  it('falls back to same-tense repeats when only one tense is requested', () => {
    const deck = buildDeckFrom(pool, config({ tenses: ['present-simple'], total: 10 }));
    expect(deck.length).toBe(10);
    expect(new Set(deck.map((q) => q.id)).size).toBe(10);
  });
});

describe('buildDailyDeckFrom', () => {
  const all = makePool(15, ['present-simple', 'past-simple', 'future-simple', 'present-perfect']);

  it('is deterministic for the same date', () => {
    const a = buildDailyDeckFrom(all, '2026-06-12', 15);
    const b = buildDailyDeckFrom(all, '2026-06-12', 15);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('changes with the date', () => {
    const a = buildDailyDeckFrom(all, '2026-06-12', 15);
    const b = buildDailyDeckFrom(all, '2026-06-13', 15);
    expect(a.map((q) => q.id)).not.toEqual(b.map((q) => q.id));
  });

  it('returns the requested number of questions without duplicates', () => {
    const deck = buildDailyDeckFrom(all, '2026-06-12', 15);
    expect(deck.length).toBe(15);
    expect(new Set(deck.map((q) => q.id)).size).toBe(15);
  });

  it('avoids consecutive same-tense questions', () => {
    const deck = buildDailyDeckFrom(all, '2026-06-12', 15);
    for (let i = 1; i < deck.length; i++) {
      expect(deck[i].sentences[0].answer).not.toBe(deck[i - 1].sentences[0].answer);
    }
  });

  it('is stable when unrelated questions are added or removed', () => {
    const deck = buildDailyDeckFrom(all, '2026-06-12', 15);
    const deckIds = new Set(deck.map((q) => q.id));
    const unrelated = all.filter((q) => !deckIds.has(q.id)).slice(0, 5);
    const shrunk = all.filter((q) => q !== unrelated[0]);

    expect(buildDailyDeckFrom(shrunk, '2026-06-12', 15).map((q) => q.id)).toEqual(
      deck.map((q) => q.id),
    );
  });
});
