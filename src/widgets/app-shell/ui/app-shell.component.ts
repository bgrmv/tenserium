import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserStore } from '@entities/user';
import { DailyStore } from '@entities/daily';
import { rankTier } from '@shared/config/rank.config';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    AvatarComponent,
    RankShieldComponent,
    IconComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private readonly userStore = inject(UserStore);
  private readonly dailyStore = inject(DailyStore);

  protected readonly profile = this.userStore.profile;
  protected readonly rank = this.userStore.rank;
  protected readonly tierMetal = () => rankTier(this.rank().tier).metal;
  protected readonly dailyStreak = this.dailyStore.streak;
  protected readonly dailyDone = this.dailyStore.isDoneToday;
}
