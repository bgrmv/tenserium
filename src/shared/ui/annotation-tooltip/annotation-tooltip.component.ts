import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Annotation } from '@shared/types';

@Component({
  selector: 'app-annotation-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './annotation-tooltip.component.css',
  template: `
    <div class="ann-tooltip" role="tooltip" (click)="close.emit()">
      <p class="ann-note">{{ annotation().note.ru ?? annotation().note.en }}</p>
      @if (annotation().example) {
        <p class="ann-example">{{ annotation().example }}</p>
      }
      @if (annotation().translation; as tr) {
        <p class="ann-translation">{{ tr.ru ?? tr.en }}</p>
      }
      <span class="ann-dismiss">✕</span>
    </div>
  `,
})
export class AnnotationTooltipComponent {
  readonly annotation = input.required<Annotation>();
  readonly close = output<void>();
}
