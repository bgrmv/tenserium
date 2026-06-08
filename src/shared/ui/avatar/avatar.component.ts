import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.font-size.px]': 'size() * 0.36',
    '[style.background]': 'background()',
    '[style.box-shadow]': 'shadow()',
    '[class.app-avatar]': 'true',
  },
  template: `
    {{ initials() }}
    @if (you()) {
      <span class="badge">YOU</span>
    }
  `,
  styles: `
    .app-avatar {
      position: relative;
      display: grid;
      place-items: center;
      border-radius: 50%;
      flex: 0 0 auto;
      font-family: var(--mono);
      font-weight: 600;
      color: oklch(0.96 0.02 var(--avatar-hue, 220));
    }
    .badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      font-size: 8px;
      font-family: var(--mono);
      font-weight: 700;
      background: var(--accent);
      color: #04121f;
      border: 2px solid var(--bg-0);
      border-radius: 5px;
      padding: 1px 3px;
    }
  `,
})
export class AvatarComponent {
  readonly name = input('?');
  readonly hue = input(220);
  readonly size = input(34);
  readonly ring = input<string | null>(null);
  readonly you = input(false);

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  protected background(): string {
    const h = this.hue();
    return `linear-gradient(150deg, oklch(0.55 0.13 ${h}), oklch(0.38 0.11 ${(h + 40) % 360}))`;
  }

  protected shadow(): string {
    const r = this.ring();
    return r
      ? `0 0 0 2px var(--bg-0), 0 0 0 4px ${r}`
      : 'inset 0 1px 0 rgba(255,255,255,.18)';
  }
}
