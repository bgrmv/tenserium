import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/config/tenses.config';
import { AdminStore } from '../../model/admin.store';

const BY_ID = Object.fromEntries(TENSES.map((t) => [t.id, t]));

@Component({
  selector: 'app-admin-aigen-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="admin-card">
      <div class="admin-card-title">Generate questions via Claude</div>
      <div class="admin-form-grid">
        <div class="admin-form-group">
          <label class="admin-form-label" for="aigen-tense">Tense</label>
          <select id="aigen-tense" class="admin-select">
            @for (t of tenses; track t.id) {
              <option [value]="t.id">{{ t.name }}</option>
            }
          </select>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="aigen-diff">Difficulty</label>
          <select id="aigen-diff" class="admin-select">
            <option>Easy</option><option selected>Medium</option><option>Hard</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="aigen-type">Type</label>
          <select id="aigen-type" class="admin-select"><option>sentence</option><option>context</option></select>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="aigen-count">Count</label>
          <input id="aigen-count" class="admin-input full" type="number" value="5" min="1" max="20" />
        </div>
      </div>
      <div class="aigen-actions">
        <button class="btn-primary sm"><app-icon name="zap" [size]="13" /> Generate</button>
        <span class="admin-cell-sub">Rate limit:</span>
        <div class="aigen-rate-track"><div class="aigen-rate-fill"></div></div>
        <span class="admin-cell-sub">38 / 50 today</span>
      </div>
    </div>
    <div class="admin-list-title">
      Draft queue — <span class="muted">{{ store.draftCount() }} pending approval</span>
    </div>
    @for (q of store.drafts(); track q.id) {
      <div class="aigen-draft">
        <div class="aigen-draft-main">
          <div class="aigen-draft-meta">{{ tenseName(q.tense) }} · {{ q.type }} · diff {{ q.diff }}</div>
          <div class="aigen-draft-text">
            {{ q.prompt }}
            <b [style.color]="tenseColor(q.tense)">[{{ q.tense }}]</b>
          </div>
        </div>
        <div class="admin-actions">
          <button class="btn-micro ok"><app-icon name="check" [size]="11" /> Approve</button>
          <button class="btn-micro danger"><app-icon name="x" [size]="11" /> Reject</button>
        </div>
      </div>
    }
  `,
})
export class AigenTabComponent {
  protected readonly store = inject(AdminStore);
  protected readonly tenses = TENSES;

  protected tenseName(id: TenseId): string {
    return BY_ID[id]?.name ?? id;
  }
  protected tenseColor(id: TenseId): string {
    const t = BY_ID[id];
    return t ? tenseColor(t, 'aspect') : 'var(--muted)';
  }
}
