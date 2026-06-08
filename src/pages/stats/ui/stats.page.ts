import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '@entities/user';
import { ASPECT_LABEL, ASPECT_ORDER, TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { Aspect } from '@shared/types';
import { ProgressBarComponent } from '@shared/ui/progress-bar/progress-bar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

const ACCURACY_BY_ASPECT: Record<Aspect, number> = {
  simple: 0.96,
  continuous: 0.9,
  perfect: 0.82,
  'perfect-continuous': 0.71,
};

@Component({
  selector: 'app-stats-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBarComponent, RankShieldComponent, IconComponent],
  templateUrl: './stats.page.html',
  styleUrl: './stats.page.css',
})
export class StatsPageComponent {
  private readonly user = inject(UserStore);
  private readonly router = inject(Router);

  protected readonly palette = signal<PaletteMode>('aspect');
  protected readonly profile = this.user.profile;
  protected readonly rank = this.user.rank;
  protected readonly aspectLabel = ASPECT_LABEL;

  protected readonly aspectRows = computed(() =>
    ASPECT_ORDER.map((aspect) => {
      const repr = TENSES.find((t) => t.aspect === aspect && t.time === 'present')!;
      return {
        aspect,
        label: ASPECT_LABEL[aspect],
        color: tenseColor(repr, this.palette()),
        accuracy: ACCURACY_BY_ASPECT[aspect],
      };
    }),
  );

  protected readonly week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  protected train(): void {
    void this.router.navigate(['/game'], { queryParams: { mode: 'rank' } });
  }
}
