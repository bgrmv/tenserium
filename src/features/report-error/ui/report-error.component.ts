import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Control, form, minLength, required } from '@angular/forms/signals';
import { StorageService } from '@shared/api/storage.service';
import type { TenseId } from '@shared/types';

interface ReportModel {
  description: string;
}

@Component({
  selector: 'app-report-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Control],
  template: `
    <div class="backdrop" role="button" tabindex="0" aria-label="Close" (click)="dismiss.emit()" (keydown.enter)="dismiss.emit()" (keydown.space)="dismiss.emit()"></div>
    <div class="modal" role="dialog" aria-label="Report an error">
      <h3>Report a problem</h3>
      <p class="sub">What's wrong with this question?</p>
      <textarea
        rows="4"
        [control]="reportForm.description"
        placeholder="Describe the issue…"
      ></textarea>
      <div class="actions">
        <button type="button" class="btn-ghost" (click)="dismiss.emit()">Cancel</button>
        <button
          type="button"
          class="btn-primary"
          [disabled]="reportForm().invalid()"
          (click)="submit()"
        >
          Send report
        </button>
      </div>
    </div>
  `,
  styleUrl: './report-error.component.css',
})
export class ReportErrorComponent {
  private readonly storage = inject(StorageService);

  readonly questionId = input.required<string>();
  readonly tenseId = input<TenseId | null>(null);

  readonly dismiss = output<void>();
  readonly sent = output<void>();

  protected readonly model = signal<ReportModel>({ description: '' });
  protected readonly reportForm = form(this.model, (path) => {
    required(path.description);
    minLength(path.description, 4);
  });

  protected submit(): void {
    if (this.reportForm().invalid()) return;
    const queue = this.storage.load<unknown[]>('reports:queue', []);
    queue.push({
      questionId: this.questionId(),
      tenseId: this.tenseId(),
      description: this.model().description,
      at: Date.now(),
    });
    this.storage.save('reports:queue', queue);
    this.sent.emit();
  }
}
