import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Question, SessionConfig, TenseId } from '@shared/types';
import { getTense } from '@shared/config/tenses.config';

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
      config.tenses.includes(q.answer),
    );
    const deck: Question[] = [];
    let prev: TenseId | null = null;

    for (let i = 0; i < config.total && pool.length > 0; i++) {
      let candidates = pool.filter((q) => q.answer !== prev);
      if (config.focusAspect) {
        const focused = candidates.filter(
          (q) => getTense(q.answer).aspect === config.focusAspect,
        );
        if (focused.length >= 2 && Math.random() < 0.65) candidates = focused;
      }
      if (candidates.length === 0) candidates = pool;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      deck.push(pick);
      prev = pick.answer;
    }
    return deck;
  }
}
