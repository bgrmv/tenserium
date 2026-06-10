import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { QuestionSentence } from '@shared/types';

export type ResultState = 'none' | 'correct' | 'wrong' | 'timeout';

@Component({
  selector: 'app-question-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.css',
})
export class QuestionCardComponent {
  readonly prompt = input.required<string>();
  readonly remainingMs = input(0);
  readonly fraction = input(1);
  readonly result = input<ResultState>('none');

  readonly revealName = input<string | null>(null);
  readonly revealColor = input('var(--accent)');
  readonly revealSentence = input<QuestionSentence | null>(null);
  readonly revealExplanation = input<string | null>(null);
  readonly revealRules = input<string | null>(null);
  readonly revealExamples = input<readonly string[] | null>(null);

  readonly gainedPoints = input<number | null>(null);

  protected get seconds(): string {
    return (this.remainingMs() / 1000).toFixed(1);
  }
}
