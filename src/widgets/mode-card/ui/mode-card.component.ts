import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { RankProgress, SessionMode } from '@shared/types';
import { ProgressBarComponent } from '@shared/ui/progress-bar/progress-bar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-mode-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe, ProgressBarComponent, RankShieldComponent, IconComponent],
  templateUrl: './mode-card.component.html',
  styleUrl: './mode-card.component.css',
})
export class ModeCardComponent {
  readonly kind = input.required<'normal' | 'rank'>();
  readonly palette = input<PaletteMode>('aspect');
  readonly rank = input<RankProgress | null>(null);

  readonly playMode = output<SessionMode>();
  readonly squad = output<void>();

  protected readonly isRank = computed(() => this.kind() === 'rank');

  protected readonly swatches = computed(() =>
    TENSES.slice(0, this.isRank() ? 6 : 12).map((t) => tenseColor(t, this.palette())),
  );
}
