import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-score-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="combo-box">
      <div class="cap">Combo</div>
      <div class="combo-val" [class.hot]="combo() >= 3">{{ combo() }}<span>×</span></div>
      <div class="ticks">
        @for (t of ticks(); track $index) {
          <span class="tick"><app-icon name="check" [size]="9" stroke="#04121f" [strokeWidth]="2.4" /></span>
        }
      </div>
    </div>
    <div class="score-box">
      <div class="cap">Score</div>
      <div class="score-val">{{ score().toLocaleString() }}</div>
    </div>
  `,
  styleUrl: './score-bar.component.css',
})
export class ScoreBarComponent {
  readonly score = input(0);
  readonly combo = input(0);

  protected ticks(): number[] {
    return Array.from({ length: Math.min(this.combo(), 8) });
  }
}
