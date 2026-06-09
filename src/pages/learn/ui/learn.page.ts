import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { LearnDetailComponent } from '@entities/learn';
import { ReportErrorComponent } from '@features/report-error';
import { TENSES, TIME_ORDER, getTense, tensesByTime } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-learn-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LearnDetailComponent, ReportErrorComponent, IconComponent],
  templateUrl: './learn.page.html',
  styleUrl: './learn.page.css',
})
export class LearnPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly palette = signal<PaletteMode>('aspect');
  protected readonly timeOrder = TIME_ORDER;

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((p) => (p.get('tenseId') as TenseId | null) ?? TENSES[0].id)),
    { initialValue: TENSES[0].id as TenseId },
  );

  protected readonly activeId = computed<TenseId>(() => this.routeId());

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

  protected readonly showReport = signal(false);
  protected readonly toastMsg = signal<string | null>(null);

  protected select(id: TenseId): void {
    void this.router.navigate(['/learn', id]);
  }

  protected train(): void {
    void this.router.navigate(['/game'], { queryParams: { mode: 'normal' } });
  }

  protected onReportSent(): void {
    this.showReport.set(false);
    this.toastMsg.set('Thanks for the report!');
    setTimeout(() => this.toastMsg.set(null), 2600);
  }
}
