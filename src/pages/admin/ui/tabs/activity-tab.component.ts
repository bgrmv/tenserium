import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-activity-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <div class="admin-kpi-row">
      <div class="admin-kpi">
        <div class="admin-kpi-val">23</div>
        <div class="admin-kpi-label">Active sessions</div>
        <div class="admin-kpi-delta up">↑ last 15 min</div>
      </div>
      <div class="admin-kpi">
        <div class="admin-kpi-val">4</div>
        <div class="admin-kpi-label">Live rank matches</div>
      </div>
      <div class="admin-kpi">
        <div class="admin-kpi-val">2</div>
        <div class="admin-kpi-label">Squad battles</div>
      </div>
      <div class="admin-kpi">
        <div class="admin-kpi-val">319</div>
        <div class="admin-kpi-label">Online today</div>
        <div class="admin-kpi-delta up">↑ 12% vs yesterday</div>
      </div>
    </div>
    <div class="admin-cols">
      <div>
        <div class="act-head"><span class="live-dot"></span> Active Sessions</div>
        @for (s of store.sessions; track s.name) {
          <div class="act-row">
            <app-avatar [name]="s.name" [hue]="210" [size]="26" />
            <div class="act-row-main">
              <div class="act-row-name">{{ s.name }}</div>
              <div class="act-row-sub">{{ s.mode }} · Q{{ s.q }}/12</div>
            </div>
            <span class="act-row-score">{{ s.score }}</span>
          </div>
        }
      </div>
      <div>
        <div class="act-head"><span class="live-dot alt"></span> Live Rank Matches</div>
        @for (m of store.liveMatches; track m.id) {
          <div class="act-match">
            <div class="act-match-avs">
              @for (p of m.players; track p) {
                <app-avatar [name]="p" [hue]="220" [size]="22" />
              }
            </div>
            <div class="act-match-sub">Q{{ m.q }}/12 · in progress</div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ActivityTabComponent {
  protected readonly store = inject(AdminStore);
}
