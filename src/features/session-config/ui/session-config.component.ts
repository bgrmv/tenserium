import {
  ChangeDetectionStrategy,
  Component,
  computed,
  output,
  signal,
} from '@angular/core';
import { Control, form, min } from '@angular/forms/signals';
import { ASPECT_LABEL, ASPECT_ORDER, TENSES } from '@shared/config/tenses.config';
import type { Aspect, SessionConfig, TenseId } from '@shared/types';

interface ConfigModel {
  length: number;
  aspects: Record<Aspect, boolean>;
}

const SESSION_LENGTHS = [10, 20, 40] as const;
const QUESTION_WINDOW_MS = 10_000;

@Component({
  selector: 'app-session-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Control],
  templateUrl: './session-config.component.html',
  styleUrl: './session-config.component.css',
})
export class SessionConfigComponent {
  protected readonly lengths = SESSION_LENGTHS;
  protected readonly aspectOrder = ASPECT_ORDER;
  protected readonly aspectLabel = ASPECT_LABEL;

  protected readonly model = signal<ConfigModel>({
    length: 20,
    aspects: {
      simple: true,
      continuous: true,
      perfect: true,
      'perfect-continuous': false,
    },
  });

  protected readonly settings = form(this.model, (path) => {
    min(path.length, 10);
  });

  private readonly selectedTenses = computed<TenseId[]>(() => {
    const enabled = this.model().aspects;
    return TENSES.filter((t) => enabled[t.aspect]).map((t) => t.id);
  });

  protected readonly canStart = computed(() => this.selectedTenses().length > 0);

  readonly configure = output<SessionConfig>();

  protected setLength(length: number): void {
    this.model.update((m) => ({ ...m, length }));
  }

  protected onStart(): void {
    if (!this.canStart()) return;
    this.configure.emit({
      mode: 'normal',
      tenses: this.selectedTenses(),
      total: this.model().length,
      windowMs: QUESTION_WINDOW_MS,
      modeMultiplier: 1,
    });
  }
}
