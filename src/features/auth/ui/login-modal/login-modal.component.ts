import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AuthService } from '@shared/api/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="modal-backdrop" role="presentation" (click)="dismissed.emit()" (keydown.escape)="dismissed.emit()">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
          <button class="modal-close" (click)="dismissed.emit()">✕</button>

          <div class="modal-header">
            <div class="modal-icon">⚡</div>
            <h2 id="login-title">Войти в Tenserium</h2>
            <p>Сохраняй прогресс и соревнуйся в рейтинге</p>
          </div>

          <div class="modal-body">
            <button class="btn-google" (click)="signIn()" [disabled]="auth.isLoading()">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Войти через Google
            </button>
          </div>

          <p class="modal-note">Анонимная игра сохраняется локально</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      position: relative;
      background: var(--surface-2, #1a1a2e);
      border: 1px solid var(--border, #2a2a3e);
      border-radius: 16px;
      padding: 2rem;
      width: min(400px, 90vw);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: var(--text-muted, #666);
      cursor: pointer;
      font-size: 1rem;
      padding: .25rem .5rem;
    }

    .modal-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;
    }

    .modal-icon { font-size: 2.5rem; }

    h2 { margin: 0; font-size: 1.25rem; }

    p { margin: 0; color: var(--text-muted, #888); font-size: .875rem; }

    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .75rem;
      padding: .75rem 1.5rem;
      background: #fff;
      color: #333;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity .15s;

      &:hover { opacity: .9; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    .modal-note {
      text-align: center;
      font-size: .75rem;
      color: var(--text-muted, #666);
    }
  `],
})
export class LoginModalComponent {
  protected readonly auth = inject(AuthService);

  readonly open = input.required<boolean>();
  readonly dismissed = output<void>();

  protected async signIn(): Promise<void> {
    await this.auth.signInWithGoogle();
  }
}
