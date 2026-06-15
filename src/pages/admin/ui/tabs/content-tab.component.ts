import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { TENSES } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/config/tenses.config';
import { AdminStore } from '../../model/admin.store';

const BY_ID = Object.fromEntries(TENSES.map((t) => [t.id, t]));
const STATUS_BADGE: Record<string, string> = {
  active: 'active', draft: 'draft', pending_review: 'open', archived: 'resolved',
};

@Component({
  selector: 'app-admin-content-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="admin-filter-row">
      <button class="admin-chip on">All</button>
      <button class="admin-chip">Flagged</button>
      <button class="admin-chip">Low accuracy</button>
      <button class="admin-chip">Drafts ({{ store.draftCount() }})</button>
      <button class="admin-chip">Pending review</button>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>ID</th><th>Tense</th><th>Type</th><th>Diff</th><th>Flags</th><th>Accuracy</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          @for (q of store.questions; track q.id) {
            <tr>
              <td><span class="admin-id">{{ q.id }}</span></td>
              <td><span [style.color]="tenseColor(q.tense)">{{ tenseName(q.tense) }}</span></td>
              <td class="admin-type">{{ q.type }}</td>
              <td><span class="admin-stars">{{ stars(q.diff) }}</span></td>
              <td>
                @if (q.flagged) {
                  <span class="admin-flag">{{ q.flagged }}</span>
                } @else {
                  <span class="admin-dash">—</span>
                }
              </td>
              <td><span class="mono">{{ q.accuracy !== null ? pct(q.accuracy) : '—' }}</span></td>
              <td><span [class]="'sbadge ' + statusBadge(q.status)">{{ q.status.replace('_', ' ') }}</span></td>
              <td>
                <div class="admin-actions">
                  <button class="btn-micro"><app-icon name="edit" [size]="11" /> Edit</button>
                  @if (q.status === 'draft') {
                    <button class="btn-micro ok"><app-icon name="check" [size]="11" /> Approve</button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ContentTabComponent {
  protected readonly store = inject(AdminStore);

  protected tenseColor(id: TenseId): string {
    const t = BY_ID[id];
    return t ? tenseColor(t, 'aspect') : 'var(--muted)';
  }
  protected tenseName(id: TenseId): string {
    return BY_ID[id]?.name ?? id;
  }
  protected pct(v: number): string {
    return Math.round(v * 100) + '%';
  }
  protected stars(d: number): string {
    return '★'.repeat(d) + '☆'.repeat(3 - d);
  }
  protected statusBadge(s: string): string {
    return STATUS_BADGE[s] ?? 'resolved';
  }
}
