import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-reports-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (store.openReportCount() > 0) {
      <div class="admin-alert">
        <app-icon name="alert" [size]="14" stroke="var(--danger)" />
        <b>{{ store.openReportCount() }} open reports</b>&nbsp;need attention
      </div>
    }
    <div class="admin-filter-row">
      <button class="admin-chip on">All ({{ store.reports.length }})</button>
      <button class="admin-chip">Open ({{ store.openReportCount() }})</button>
      <button class="admin-chip">Resolved</button>
      <button class="admin-chip">Dismissed</button>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Question ID</th><th>Reporter</th><th>Description</th><th>Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          @for (r of store.reports; track r.id) {
            <tr>
              <td><span class="admin-id">{{ r.qid }}</span></td>
              <td class="admin-type">{{ r.reporter }}</td>
              <td class="admin-cell-desc">{{ r.desc }}</td>
              <td class="admin-cell-sub">{{ r.date }}</td>
              <td><span [class]="'sbadge ' + r.status">{{ r.status }}</span></td>
              <td>
                <div class="admin-actions">
                  <button class="btn-micro"><app-icon name="edit" [size]="11" /> Fix</button>
                  @if (r.status === 'open') {
                    <button class="btn-micro"><app-icon name="check" [size]="11" /> Dismiss</button>
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
export class ReportsTabComponent {
  protected readonly store = inject(AdminStore);
}
