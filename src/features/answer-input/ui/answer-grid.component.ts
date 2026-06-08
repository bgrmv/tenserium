import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import { HotkeysService } from '@shared/lib/hotkeys.service';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-answer-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './answer-grid.component.html',
  styleUrl: './answer-grid.component.css',
})
export class AnswerGridComponent {
  private readonly hotkeys = inject(HotkeysService);
  private readonly destroyRef = inject(DestroyRef);

  readonly palette = input<PaletteMode>('aspect');
  readonly columns = input<3 | 4>(4);
  readonly lockedIds = input<readonly TenseId[]>([]);
  readonly revealId = input<TenseId | null>(null);
  readonly pickedId = input<TenseId | null>(null);
  readonly hintId = input<TenseId | null>(null);
  readonly disabled = input(false);

  readonly answer = output<TenseId>();

  protected readonly tenses = TENSES;

  protected readonly cells = computed(() =>
    TENSES.map((t) => ({
      tense: t,
      color: tenseColor(t, this.palette()),
      locked: this.lockedIds().includes(t.id),
    })),
  );

  constructor() {
    this.hotkeys.tenseKey$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.pick(id));
  }

  protected pick(id: TenseId): void {
    if (this.disabled() || this.revealId() !== null) return;
    if (this.lockedIds().includes(id)) return;
    this.answer.emit(id);
  }

  protected stateClass(id: TenseId, locked: boolean): string {
    if (locked) return 'is-locked';
    const reveal = this.revealId();
    if (!reveal) return id === this.hintId() ? 'is-hint' : '';
    if (id === reveal) return 'is-correct';
    if (id === this.pickedId()) return 'is-wrong';
    return 'is-dim';
  }
}
