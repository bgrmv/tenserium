import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Player } from '@shared/types';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { ProgressBarComponent } from '@shared/ui/progress-bar/progress-bar.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-squad-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, ProgressBarComponent, IconComponent],
  template: `
    <div class="title"><app-icon name="squad" [size]="13" /> Squad · live</div>
    @for (p of players(); track p.id; let i = $index) {
      <div class="row" [class.is-you]="p.id === 'you'">
        <span class="place">{{ i + 1 }}</span>
        <app-avatar [name]="p.name" [hue]="p.avatarHue" [size]="24" [you]="p.id === 'you'" />
        <div class="prog">
          <div class="name">{{ p.name }}</div>
          <app-progress-bar
            [value]="p.answered"
            [max]="total()"
            [height]="4"
            [color]="p.id === 'you' ? 'var(--accent)' : 'oklch(0.6 0.12 ' + p.avatarHue + ')'"
          />
        </div>
        <span class="score">{{ p.score }}</span>
      </div>
    }
  `,
  styleUrl: './squad-board.component.css',
})
export class SquadBoardComponent {
  readonly players = input.required<readonly Player[]>();
  readonly total = input(12);
}
