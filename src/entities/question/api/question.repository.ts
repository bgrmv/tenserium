import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Question, SessionConfig, TenseId } from '@shared/types';
import { buildDailyDeckFrom, buildDeckFrom } from '../lib/deck';

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
    return buildDeckFrom(this.questions.value() ?? [], config);
  }

  buildDailyDeck(dateStr: string, total = 15): Question[] {
    return buildDailyDeckFrom(this.questions.value() ?? [], dateStr, total);
  }
}
