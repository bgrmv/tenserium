import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-audit-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <div class="admin-filter-row">
      <input class="admin-input" placeholder="Filter by admin…" style="min-width:150px" />
      <select class="admin-select">
        <option>All actions</option>
        <option>Bans</option>
        <option>Warnings</option>
        <option>Edits</option>
      </select>
      <input class="admin-input" type="date" value="2026-06-14" />
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target</th><th>Reason</th></tr>
        </thead>
        <tbody>
          @for (a of store.audit; track a.ts) {
            <tr>
              <td><span class="audit-ts">{{ a.ts }}</span></td>
              <td>
                <div class="admin-user sm">
                  <app-avatar [name]="a.admin" [hue]="24" [size]="22" />
                  <span class="admin-type">{{ a.admin }}</span>
                </div>
              </td>
              <td><span class="audit-action">{{ a.action }}</span></td>
              <td class="admin-type">{{ a.target }}</td>
              <td class="admin-cell-desc">{{ a.reason }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="audit-note">Read-only · All admin actions are immutable records</div>
  `,
})
export class AuditTabComponent {
  protected readonly store = inject(AdminStore);
}
