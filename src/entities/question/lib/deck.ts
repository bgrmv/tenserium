import type { Question, SessionConfig, TenseId } from '@shared/types';
import { getTense } from '@shared/config/tenses.config';
import { seededRandom } from '@shared/lib/seeded-random';

/**
 * Random deck for a normal session. Samples without replacement, avoids two
 * consecutive questions on the same tense, optionally biases towards a focus
 * aspect.
 */
export function buildDeckFrom(source: readonly Question[], config: SessionConfig): Question[] {
  const pool = source.filter((q) => config.tenses.includes(q.sentences[0].answer));
  const deck: Question[] = [];
  let prev: TenseId | null = null;

  for (let i = 0; i < config.total && pool.length > 0; i++) {
    let candidates = pool.filter((q) => q.sentences[0].answer !== prev);
    if (config.focusAspect) {
      const focused = candidates.filter(
        (q) => getTense(q.sentences[0].answer).aspect === config.focusAspect,
      );
      if (focused.length >= 2 && Math.random() < 0.65) candidates = focused;
    }
    if (candidates.length === 0) candidates = pool;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    deck.push(pick);
    pool.splice(pool.indexOf(pick), 1);
    prev = pick.sentences[0].answer;
  }
  return deck;
}

/**
 * Deterministic deck for a given date string ('YYYY-MM-DD'). Every player with
 * the same seed gets the same questions in the same order.
 *
 * Each question is ranked by its own `date:id` hash, so the selection is
 * stable against content changes elsewhere: adding or removing other questions
 * never reshuffles the whole deck, it only competes for a slot.
 */
export function buildDailyDeckFrom(
  source: readonly Question[],
  dateStr: string,
  total: number,
): Question[] {
  if (source.length === 0) return [];
  const ranked = source
    .map((q) => ({ q, key: seededRandom(`${dateStr}:${q.id}`)() }))
    .sort((a, b) => a.key - b.key || a.q.id.localeCompare(b.q.id))
    .map((x) => x.q);

  const deck: Question[] = [];
  let prev: TenseId | null = null;
  for (const q of ranked) {
    if (deck.length >= total) break;
    if (q.sentences[0].answer !== prev) {
      deck.push(q);
      prev = q.sentences[0].answer;
    }
  }
  if (deck.length < total) {
    for (const q of ranked) {
      if (deck.length >= total) break;
      if (!deck.includes(q)) deck.push(q);
    }
  }
  return deck;
}
