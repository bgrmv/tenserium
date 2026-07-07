import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserStore } from '@entities/user';
import { DailyStore } from '@entities/daily';
import { rankTier } from '@shared/config/rank.config';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AuthService } from '@shared/api/auth.service';
import { LoginModalComponent } from '@features/auth';

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
    LoginModalComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private readonly userStore = inject(UserStore);
  private readonly dailyStore = inject(DailyStore);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly profile = this.userStore.profile;
  protected readonly rank = this.userStore.rank;
  protected readonly tierMetal = () => rankTier(this.rank().tier).metal;
  protected readonly dailyStreak = this.dailyStore.streak;
  protected readonly dailyDone = this.dailyStore.isDoneToday;
  protected readonly loginOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.currentUser()) {
        this.loginOpen.set(false);
        const parsed = this.router.parseUrl(this.router.url);
        const returnUrl = parsed.queryParams['returnUrl'];
        if (returnUrl) {
          void this.router.navigateByUrl(returnUrl);
        }
      }
    });
  }

  protected openLogin(): void {
    this.loginOpen.set(true);
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
