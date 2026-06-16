import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-moderation-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconComponent],
  template: `
    <div class="admin-search">
      <input class="admin-input wide" placeholder="Search user to moderate…" />
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>User</th><th>League</th><th>RP</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          @for (u of store.users; track u.id) {
            <tr>
              <td>
                <div class="admin-user">
                  <app-avatar [name]="u.name" [hue]="210" [size]="26" />
                  <span class="admin-user-name">{{ u.name }}</span>
                </div>
              </td>
              <td><span class="sbadge active">{{ u.league }}</span></td>
              <td class="mono">{{ u.rp.toLocaleString() }}</td>
              <td>
                @if (u.status === 'banned') {
                  <span class="sbadge banned">Banned</span>
                } @else {
                  <span class="sbadge active">Active</span>
                }
              </td>
              <td>
                <div class="admin-actions">
                  <button class="btn-micro"><app-icon name="alert" [size]="11" /> Warn</button>
                  <button class="btn-micro"><app-icon name="clock" [size]="11" /> Suspend</button>
                  <button class="btn-micro danger"><app-icon name="ban" [size]="11" /> Ban</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="admin-panel mt">
      <div class="admin-eyebrow sm">Manual rank adjustment</div>
      <div class="mod-adjust">
        <input class="admin-input" placeholder="Username" style="width:160px" />
        <input class="admin-input" placeholder="+/- RP (e.g. +200)" style="width:160px" />
        <input class="admin-input wide" placeholder="Reason…" style="min-width:160px" />
        <button class="btn-ghost sm">Apply</button>
      </div>
    </div>
  `,
})
export class ModerationTabComponent {
  protected readonly store = inject(AdminStore);
}
