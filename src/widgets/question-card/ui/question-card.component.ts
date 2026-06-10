import { ChangeDetectionStrategy, Component, effect, input, signal, untracked } from '@angular/core';
import type { Annotation, QuestionSentence, Token } from '@shared/types';
import { AnnotationTooltipComponent } from '@shared/ui/annotation-tooltip/annotation-tooltip.component';

export type ResultState = 'none' | 'correct' | 'wrong' | 'timeout';

@Component({
  selector: 'app-question-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnnotationTooltipComponent],
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
  readonly autoAnnotation = input(false);

  protected readonly activeAnnotation = signal<Annotation | null>(null);

  constructor() {
    effect(() => {
      if (this.result() === 'none') {
        untracked(() => this.activeAnnotation.set(null));
      } else if (this.autoAnnotation()) {
        const first = this.revealSentence()?.annotations?.[0] ?? null;
        untracked(() => this.activeAnnotation.set(first));
      }
    });
  }

  protected get seconds(): string {
    return (this.remainingMs() / 1000).toFixed(1);
  }

  protected tokenClass(t: Token): string {
    if (t.role === 'verb') return 'tok-keyword';
    if (t.type === 'punct') return 'tok-punct';
    if (t.type === 'space') return '';
    return 'tok-other';
  }

  protected annotationFor(idx: number, annotations?: readonly Annotation[]): Annotation | null {
    return annotations?.find(a => idx >= a.from && idx <= a.to) ?? null;
  }

  protected showAnnotation(ann: Annotation): void {
    this.activeAnnotation.set(ann);
  }
}
