import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@shared/api/auth.service';
import { LogoComponent } from '@shared/ui/logo/logo.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent],
  template: `
    <div class="page">
      <div class="card">
        <div class="logo-row">
          <app-logo [size]="36" />
          <span class="brand">Tenserium</span>
        </div>

        <div class="heading">
          <h1>Войти</h1>
          <p>Сохраняй прогресс и соревнуйся в рейтинге</p>
        </div>

        <div class="actions">
          <button class="btn-google" (click)="signIn()" [disabled]="auth.isLoading()">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            @if (auth.isLoading()) { Загрузка… } @else { Войти через Google }
          </button>
        </div>

        <p class="guest-note">
          Анонимная игра сохраняется локально —
          <a (click)="goHome()" class="link" role="button" tabindex="0" (keydown.enter)="goHome()">
            играть без аккаунта
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-0);
      padding: 16px;
    }

    .card {
      width: min(420px, 100%);
      background: var(--bg-1);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 40px 36px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .logo-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand {
      font-family: var(--display);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .heading {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .actions { display: flex; flex-direction: column; gap: 12px; }

    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 20px;
      background: #fff;
      color: #333;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover { opacity: 0.92; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .guest-note {
      text-align: center;
      font-size: 0.8125rem;
      color: var(--dim, #555);
    }

    .link {
      color: var(--accent);
      cursor: pointer;
      text-decoration: underline;
      background: none;
      border: none;
      font: inherit;
      padding: 0;
    }
  `],
})
export class LoginPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      if (this.auth.currentUser()) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home';
        void this.router.navigateByUrl(returnUrl);
      }
    });
  }

  protected async signIn(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home';
    await this.auth.signInWithGoogle(returnUrl);
  }

  protected goHome(): void {
    void this.router.navigate(['/home']);
  }
}
