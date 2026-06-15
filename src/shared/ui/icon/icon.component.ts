import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'trainer' | 'learn' | 'stats' | 'logout' | 'bell' | 'gear' | 'lock'
  | 'play' | 'flame' | 'shield' | 'trophy' | 'arrow-right' | 'arrow-left' | 'zap'
  | 'check' | 'clock' | 'bolt' | 'repeat' | 'globe' | 'calendar' | 'squad'
  | 'flag' | 'list' | 'share' | 'copy' | 'daily' | 'x'
  | 'eye' | 'edit' | 'alert' | 'ban' | 'send' | 'download' | 'plus' | 'chat';

const PATHS: Record<IconName, string> = {
  trainer: 'M6 12a6 6 0 0 1 12 0 M9 12h6 M12 9v6 M3 12h2 M19 12h2',
  learn: 'M4 5h11a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z M20 5h-1a3 3 0 0 0-3 3v8',
  stats: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  logout: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4 M10 12H3 M6 8l-4 4 4 4',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 21a2 2 0 0 0 4 0',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M12 2v3 M12 19v3 M5 5l2 2 M17 17l2 2 M2 12h3 M19 12h3 M5 19l2-2 M17 7l2-2',
  lock: 'M6 11h12v9H6z M9 11V8a3 3 0 0 1 6 0v3',
  play: 'M8 5v14l11-7z',
  flame: 'M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 2 2 2 4',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  trophy: 'M7 4h10v4a5 5 0 0 1-10 0z M7 6H4v1a3 3 0 0 0 3 3 M17 6h3v1a3 3 0 0 1-3 3 M9 16h6 M12 12v4 M8 20h8',
  'arrow-right': 'M5 12h14 M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5 M11 18l-6-6 6-6',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
  copy: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2H8z',
  daily: 'M8 2v3 M16 2v3 M3 7h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M8 12h4 M8 16h8',
  zap: 'M13 3 5 14h5l-1 7 8-11h-5z',
  check: 'M5 12l4 4 10-10',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 3',
  bolt: 'M13 3 5 14h5l-1 7 8-11h-5z',
  repeat: 'M4 9a6 6 0 0 1 10-4l2 2M20 15a6 6 0 0 1-10 4l-2-2 M14 3v4h4 M10 21v-4H6',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M3 12h18 M12 3c2.5 2.5 2.5 15.5 0 18 M12 3c-2.5 2.5-2.5 15.5 0 18',
  calendar: 'M5 5h14v15H5z M5 9h14 M9 3v4 M15 3v4',
  squad: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M3 20a6 6 0 0 1 12 0 M17 11a3 3 0 1 0-2-5 M16 14a6 6 0 0 1 5 6',
  x: 'M18 6 6 18 M6 6l12 12',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  ban: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M4.93 4.93l14.14 14.14',
  send: 'M22 2 11 13 M22 2 15 22 9 13 2 9l20-7z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  plus: 'M12 5v14 M5 12h14',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24"
         [attr.fill]="isFilled() ? 'currentColor' : 'none'"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @for (seg of segments(); track $index) {
        <path [attr.d]="seg" [attr.stroke]="stroke()" [attr.stroke-width]="strokeWidth()" />
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly stroke = input('var(--text)');
  readonly strokeWidth = input(1.5);

  protected readonly isFilled = computed(() => this.stroke() === 'none');

  protected segments(): string[] {
    return (PATHS[this.name()] ?? '')
      .split(' M')
      .map((seg, i) => (i === 0 ? seg : 'M' + seg));
  }
}
