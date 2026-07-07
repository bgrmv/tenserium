import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@shared/api/auth.service';
import { UserStore } from '@entities/user';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { rankTier } from '@shared/config/rank.config';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, RankShieldComponent, IconComponent, TitleCasePipe],
  template: `
    @if (auth.currentUser(); as user) {
      <div class="profile-page">
        <div class="card hero-card">
          <app-avatar [name]="user.nickname ?? user.email" [hue]="210" [size]="80" />
          <div class="hero-info">
            <h1 class="nickname">{{ user.nickname ?? user.email }}</h1>
            <span class="email">{{ user.email }}</span>
            @if (user.appRole !== 'user') {
              <span class="role-badge">{{ user.appRole }}</span>
            }
          </div>
        </div>

        <div class="card rank-card">
          <div class="rank-row">
            <app-rank-shield [metal]="tierMetal()" [size]="40" />
            <div>
              <div class="rank-label">Ранг</div>
              <div class="rank-value">{{ user.rankTier | titlecase }}</div>
            </div>
          </div>
          <div class="stat-row">
            <span class="stat-label">Лига</span>
            <span class="stat-value league">{{ leagueLabel() }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Серия</span>
            <span class="stat-value">
              <app-icon name="flame" [size]="14" stroke="var(--warm)" />
              {{ profile().streakDays }} дней
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Очки</span>
            <span class="stat-value">{{ profile().rankPoints }}</span>
          </div>
        </div>

        <div class="card actions-card">
          <button class="btn-danger" (click)="signOut()">
            <app-icon name="logout" [size]="16" />
            Выйти
          </button>
        </div>
      </div>
    } @else {
      <div class="not-auth">
        <p>Войдите, чтобы увидеть профиль</p>
        <button class="btn-primary" (click)="goHome()">На главную</button>
      </div>
    }
  `,
  styles: [`
    .profile-page {
      max-width: 480px;
      margin: 40px auto;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card {
      background: var(--bg-1);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 24px;
    }

    .hero-card {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .hero-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    h1.nickname {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email {
      font-size: 0.8125rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: oklch(0.7 0.14 248 / 0.2);
      color: var(--accent);
      width: fit-content;
    }

    .rank-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rank-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .rank-label {
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .rank-value {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--line);
    }

    .stat-label { font-size: 0.875rem; color: var(--muted); }

    .stat-value {
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .league { text-transform: capitalize; }

    .actions-card { display: flex; flex-direction: column; gap: 10px; }

    .btn-danger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid var(--danger, #ef4444);
      background: none;
      color: var(--danger, #ef4444);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.14s;
      width: fit-content;

      &:hover { background: oklch(0.5 0.18 27 / 0.12); }
    }

    .not-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 80px 16px;
      color: var(--muted);
    }

    .btn-primary {
      padding: 9px 20px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }
  `],
})
export class ProfilePageComponent {
  protected readonly auth = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  protected readonly profile = this.userStore.profile;
  protected readonly rank = this.userStore.rank;
  protected readonly tierMetal = () => rankTier(this.rank().tier).metal;

  protected readonly leagueLabel = () => {
    const map: Record<string, string> = {
      elementary: 'Elementary (A1–A2)',
      intermediate: 'Intermediate (B1–B2)',
      advanced: 'Advanced (C1–C2)',
    };
    return map[this.auth.currentUser()?.league ?? ''] ?? this.auth.currentUser()?.league ?? '—';
  };

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    void this.router.navigate(['/home']);
  }

  protected goHome(): void {
    void this.router.navigate(['/home']);
  }
}
