import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Player } from '@shared/types';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-session-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, RankShieldComponent, IconComponent],
  templateUrl: './session-summary.component.html',
  styleUrl: './session-summary.component.css',
})
export class SessionSummaryComponent {
  readonly title = input('Practice');
  readonly tag = input('Normal Mode');
  readonly score = input(0);
  readonly accuracy = input(0);
  readonly correct = input(0);
  readonly total = input(0);
  readonly bestStreak = input(0);
  readonly forfeited = input(false);
  readonly board = input<readonly Player[] | null>(null);
  readonly place = input(1);

  readonly again = output<void>();
  readonly exit = output<void>();

  protected readonly placeLabel = computed(() => {
    if (this.forfeited()) return 'Ended';
    return ['1st', '2nd', '3rd', '4th'][this.place() - 1] ?? `${this.place()}th`;
  });

  protected readonly metal = computed(() => {
    if (this.forfeited()) return '#6b7280';
    return this.place() === 1 ? '#d9b44a' : '#b9c2cc';
  });

  protected readonly accuracyPct = computed(() => Math.round(this.accuracy() * 100));
}
