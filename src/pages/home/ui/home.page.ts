import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '@entities/user';
import type { PaletteMode } from '@shared/config/tense-colors';
import type { SessionMode } from '@shared/types';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { ProgressBarComponent } from '@shared/ui/progress-bar/progress-bar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ModeCardComponent } from '@widgets/mode-card';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModeCardComponent,
    AvatarComponent,
    ProgressBarComponent,
    RankShieldComponent,
    IconComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePageComponent {
  private readonly user = inject(UserStore);
  private readonly router = inject(Router);

  protected readonly palette = signal<PaletteMode>('aspect');
  protected readonly profile = this.user.profile;
  protected readonly rank = this.user.rank;
  protected readonly firstName = computed(() => this.profile().nickname.split(' ')[0]);

  constructor() {
    if (!this.user.profile().hasSeenOnboarding) {
      void this.router.navigate(['/onboarding']);
    }
  }

  protected start(mode: SessionMode): void {
    void this.router.navigate(['/game'], { queryParams: { mode } });
  }
}
