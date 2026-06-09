import { Injectable, inject, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { TenseId } from '@shared/types';

export interface UsageNote {
  readonly icon: string;
  readonly text: string;
}

export interface LearnExample {
  readonly pre: string;
  readonly verb: string;
  readonly post: string;
}

export interface TenseStructure {
  readonly affirmative: string;
  readonly negative: string;
  readonly question: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export interface LearnContent {
  readonly tenseId: TenseId;
  readonly formula: readonly string[];
  readonly structure?: TenseStructure;
  readonly usage: readonly UsageNote[];
  readonly examples: readonly LearnExample[];
  readonly markers: readonly string[];
  readonly faq?: readonly FaqItem[];
}

/**
 * Serves Learn-page content per tense (`assets/learn/{tense-id}.json`).
 * Set {@link tenseId}; read {@link content}.
 */
@Injectable({ providedIn: 'root' })
export class LearnRepository {
  private readonly http = inject(HttpClient);

  readonly tenseId = signal<TenseId | null>(null);

  readonly content = resource<LearnContent | null, TenseId | null>({
    params: () => this.tenseId(),
    loader: async ({ params }) => {
      if (!params) return null;
      return firstValueFrom(this.http.get<LearnContent>(`assets/learn/${params}.json`));
    },
  });
}
