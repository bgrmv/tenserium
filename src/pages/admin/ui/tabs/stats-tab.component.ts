import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { TenseConfig } from '@shared/config/tenses.config';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-stats-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-kpi-row">
      <div class="admin-kpi"><div class="admin-kpi-val">319</div><div class="admin-kpi-label">DAU</div><div class="admin-kpi-delta up">↑ 12%</div></div>
      <div class="admin-kpi"><div class="admin-kpi-val">1.4k</div><div class="admin-kpi-label">WAU</div><div class="admin-kpi-delta up">↑ 8%</div></div>
      <div class="admin-kpi"><div class="admin-kpi-val">5.2k</div><div class="admin-kpi-label">MAU</div><div class="admin-kpi-delta up">↑ 21%</div></div>
      <div class="admin-kpi"><div class="admin-kpi-val">2,847</div><div class="admin-kpi-label">Questions today</div><div class="admin-kpi-delta up">91% correct</div></div>
    </div>
    <div class="admin-cols tight">
      <div class="admin-panel">
        <div class="admin-eyebrow">League distribution</div>
        @for (lg of store.leagueShares; track lg.name) {
          <div class="stat-bar-row">
            <span class="stat-bar-label">{{ lg.name }}</span>
            <div class="stat-bar-track">
              <div class="stat-bar-fill" [style.width.%]="lg.pct" [style.background]="lg.color"></div>
            </div>
            <span class="stat-bar-val">{{ lg.pct }}%</span>
          </div>
        }
      </div>
      <div class="admin-panel">
        <div class="admin-eyebrow">New registrations (last 7d)</div>
        <div class="stat-regbars">
          @for (b of store.registrations; track $index) {
            <div class="stat-regbar" [style.height.%]="b.heightPct"></div>
          }
        </div>
        <div class="stat-reglabels">
          @for (b of store.registrations; track $index) {
            <div class="stat-reglabel">{{ b.label }}</div>
          }
        </div>
      </div>
    </div>
    <div class="admin-panel">
      <div class="admin-eyebrow">Accuracy heatmap by tense</div>
      <div class="heatmap-grid">
        @for (t of tenses; track t.id) {
          <div class="stat-heat-cell" [style.background]="heatBg(t)" [style.border]="heatBorder(t)">
            <div class="stat-heat-name">{{ t.name }}</div>
            <div class="stat-heat-val" [style.color]="color(t)">{{ acc(t.id) }}%</div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StatsTabComponent {
  protected readonly store = inject(AdminStore);
  protected readonly tenses = TENSES;

  protected color(t: TenseConfig): string {
    return tenseColor(t, 'aspect');
  }
  protected acc(id: string): number {
    return this.store.heatmap[id] ?? 70;
  }
  protected heatBg(t: TenseConfig): string {
    const pct = Math.max(8, Math.round(this.acc(t.id) / 4));
    return `color-mix(in oklab,${this.color(t)} ${pct}%,var(--bg-2))`;
  }
  protected heatBorder(t: TenseConfig): string {
    return `1px solid color-mix(in oklab,${this.color(t)} 25%,transparent)`;
  }
}
