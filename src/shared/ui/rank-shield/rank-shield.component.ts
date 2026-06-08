import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-rank-shield',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="wrap">
      <app-icon name="shield" [size]="size()" [stroke]="metal()" />
      <app-icon class="inner" name="trophy" [size]="size() * 0.42" [stroke]="metal()" [strokeWidth]="1.8" />
    </span>
  `,
  styles: `
    .wrap { position: relative; display: inline-grid; place-items: center; }
    .inner { position: absolute; }
  `,
})
export class RankShieldComponent {
  readonly metal = input('#c08457');
  readonly size = input(30);
}
