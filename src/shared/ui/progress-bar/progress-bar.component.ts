import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="track" [style.height.px]="height()">
      <div
        class="fill"
        [style.width.%]="pct()"
        [style.background]="color()"
        [style.box-shadow]="glow() ? '0 0 10px ' + color() : 'none'"
      ></div>
    </div>
  `,
  styles: `
    .track { width: 100%; border-radius: 999px; overflow: hidden; background: rgba(255, 255, 255, 0.08); }
    .fill { height: 100%; border-radius: 999px; transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  `,
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly max = input(1);
  readonly height = input(6);
  readonly color = input('var(--accent)');
  readonly glow = input(false);

  protected readonly pct = computed(() =>
    Math.max(0, Math.min(1, this.value() / (this.max() || 1))) * 100,
  );
}
