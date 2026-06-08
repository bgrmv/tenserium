import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 32 32" fill="none" aria-label="Tenserium">
      <circle cx="16" cy="16" r="14" [attr.stroke]="accent()" stroke-width="2" opacity="0.35" />
      <path
        d="M17.5 5 L9 18 H15 L13.5 27 L23 13 H16.5 Z"
        [attr.fill]="accent()"
        [attr.stroke]="accent()"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class LogoComponent {
  readonly size = input(26);
  readonly accent = input('var(--accent)');
}
