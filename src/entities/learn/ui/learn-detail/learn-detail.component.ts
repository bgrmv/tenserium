import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnRepository } from '../../api/learn.repository';
import { TENSES, getTense } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-learn-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink],
  templateUrl: './learn-detail.component.html',
  styleUrl: './learn-detail.component.css',
})
export class LearnDetailComponent {
  private readonly repo = inject(LearnRepository);

  readonly tenseId = input.required<TenseId>();
  readonly palette = input<PaletteMode>('aspect');
  readonly reportClick = output<void>();
  readonly trainClick = output<void>();

  protected readonly tense = computed(() => getTense(this.tenseId()));
  protected readonly color = computed(() => tenseColor(this.tense(), this.palette()));
  protected readonly content = this.repo.content;

  constructor() {
    effect(() => {
      this.repo.tenseId.set(this.tenseId());
    });
  }

  protected readonly prevId = computed<TenseId | null>(() => {
    const order = this.tense().order;
    return (TENSES.find((t) => t.order === order - 1)?.id ?? null) as TenseId | null;
  });

  protected readonly nextId = computed<TenseId | null>(() => {
    const order = this.tense().order;
    return (TENSES.find((t) => t.order === order + 1)?.id ?? null) as TenseId | null;
  });

  protected readonly prevName = computed(() => {
    const id = this.prevId();
    return id ? getTense(id).name : null;
  });

  protected readonly nextName = computed(() => {
    const id = this.nextId();
    return id ? getTense(id).name : null;
  });
}
