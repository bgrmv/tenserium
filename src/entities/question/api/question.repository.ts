import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Question, SessionConfig, TenseId } from '@shared/types';
import { getTense } from '@shared/config/tenses.config';
import { seededRandom, seededShuffle } from '@shared/lib/seeded-random';

/**
 * Loads and serves the question bank. Banks are split per tense
 * (`assets/questions/{tense-id}.json`) and fetched lazily for exactly the
 * tenses a session needs, via the `resource()` async primitive.
 */
@Injectable({ providedIn: 'root' })
export class QuestionRepository {
  private readonly http = inject(HttpClient);

  readonly tenseIds = signal<readonly TenseId[]>([]);

  readonly questions = resource<Question[], readonly TenseId[]>({
    params: () => this.tenseIds(),
    loader: async ({ params }) => {
      if (params.length === 0) return [];
      const banks = await Promise.all(
        params.map((id) =>
          firstValueFrom(this.http.get<Question[]>(`assets/questions/${id}.json`)),
        ),
      );
      return banks.flat();
    },
  });

  readonly isLoading = computed(() => this.questions.isLoading());

  buildDeck(config: SessionConfig): Question[] {
    const pool = (this.questions.value() ?? []).filter((q) =>
      config.tenses.includes(q.sentences[0].answer),
    );
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
      prev = pick.sentences[0].answer;
    }
    return deck;
  }

  /**
   * Deterministic deck for a given date string ('YYYY-MM-DD').
   * Every player with the same seed gets the same 15 questions in the same order.
   */
  buildDailyDeck(dateStr: string, total = 15): Question[] {
    const all = this.questions.value() ?? [];
    if (all.length === 0) return [];
    const rng = seededRandom(dateStr);
    const shuffled = seededShuffle(all, rng);
    // Ensure no two consecutive same-tense questions
    const deck: Question[] = [];
    let prev: TenseId | null = null;
    for (const q of shuffled) {
      if (deck.length >= total) break;
      if (q.sentences[0].answer !== prev) {
        deck.push(q);
        prev = q.sentences[0].answer;
      }
    }
    // If we fell short (edge case: all shuffled items had same tense), top up
    if (deck.length < total) {
      for (const q of shuffled) {
        if (deck.length >= total) break;
        if (!deck.includes(q)) deck.push(q);
      }
    }
    return deck;
  }
}
