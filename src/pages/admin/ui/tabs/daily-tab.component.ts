import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import { AdminStore } from '../../model/admin.store';

const BY_ID = Object.fromEntries(TENSES.map((t) => [t.id, t]));
const OVERRIDE_DAYS = [8, 14];
const TODAY = 14;
const CURATED = ['q-pp-02', 'q-fs-03', 'q-ps-01'];

@Component({
  selector: 'app-admin-daily-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="daily-cols">
      <div>
        <div class="daily-month">June 2026</div>
        <div class="day-grid">
          @for (d of days; track d) {
            <div [class]="dayClass(d)">
              <div class="d-m">Jun</div>
              <div class="d-n">{{ d }}</div>
              @if (hasOverride(d)) {
                <div class="d-ov">✓</div>
              }
            </div>
          }
        </div>
      </div>
      <div class="admin-panel">
        <div class="daily-side-title">June 14 — Today</div>
        <div class="daily-override">
          <app-icon name="edit" [size]="11" stroke="var(--warm)" /> Custom override active
        </div>
        <div class="admin-eyebrow sm">Curated questions</div>
        @for (qid of curated; track qid; let i = $index) {
          <div class="daily-q">
            <span class="admin-id">{{ i + 1 }}</span>
            <div class="daily-q-main">
              <div class="admin-id">{{ qid }}</div>
              <div class="daily-q-name" [style.color]="qColor(qid)">{{ qTenseName(qid) }}</div>
            </div>
            <button class="btn-micro"><app-icon name="x" [size]="10" /></button>
          </div>
        }
        <div class="daily-foot">
          <button class="btn-micro ok"><app-icon name="plus" [size]="11" /> Add question</button>
          <button class="btn-ghost sm">Save override</button>
        </div>
      </div>
    </div>
  `,
})
export class DailyTabComponent {
  protected readonly store = inject(AdminStore);
  protected readonly days = Array.from({ length: 30 }, (_, i) => i + 1);
  protected readonly curated = CURATED;

  protected dayClass(d: number): string {
    return 'day-cell' + (d === TODAY ? ' sel' : '') + (OVERRIDE_DAYS.includes(d) ? ' has-ov' : '');
  }
  protected hasOverride(d: number): boolean {
    return OVERRIDE_DAYS.includes(d);
  }

  private qTense(qid: string) {
    const q = this.store.questions.find((x) => x.id === qid);
    return q ? BY_ID[q.tense] : null;
  }
  protected qColor(qid: string): string {
    const t = this.qTense(qid);
    return t ? tenseColor(t, 'aspect') : 'var(--muted)';
  }
  protected qTenseName(qid: string): string {
    return this.qTense(qid)?.name ?? '—';
  }
}
