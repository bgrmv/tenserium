import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LearnRepository } from '@entities/learn';
import { TENSES, TIME_ORDER, getTense, tensesByTime } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-learn-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './learn.page.html',
  styleUrl: './learn.page.css',
})
export class LearnPageComponent {
  private readonly repo = inject(LearnRepository);
  private readonly router = inject(Router);

  protected readonly palette = signal<PaletteMode>('aspect');
  protected readonly activeId = signal<TenseId>(TENSES[0].id);
  protected readonly timeOrder = TIME_ORDER;

  protected readonly groups = computed(() =>
    this.timeOrder.map((time) => ({
      time,
      tenses: tensesByTime(time).map((t) => ({
        ...t,
        color: tenseColor(t, this.palette()),
        active: t.id === this.activeId(),
      })),
    })),
  );

  protected readonly active = computed(() => getTense(this.activeId()));
  protected readonly activeColor = computed(() => tenseColor(this.active(), this.palette()));

  protected readonly content = this.repo.content;

  constructor() {
    this.repo.tenseId.set(this.activeId());
  }

  protected select(id: TenseId): void {
    this.activeId.set(id);
    this.repo.tenseId.set(id);
  }

  protected train(): void {
    void this.router.navigate(['/game'], { queryParams: { mode: 'normal' } });
  }
}
