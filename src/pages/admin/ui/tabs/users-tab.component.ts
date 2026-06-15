import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-users-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconComponent],
  template: `
    <div class="admin-search">
      <input class="admin-input wide" placeholder="Search by name or email…" />
      <button class="btn-ghost sm"><app-icon name="download" [size]="13" /> Export</button>
    </div>
    <div class="admin-filter-row">
      <button class="admin-chip on">All</button>
      <button class="admin-chip">Premium</button>
      <button class="admin-chip">Expert+</button>
      <button class="admin-chip">Inactive 7d+</button>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>User</th><th>Email</th><th>League</th>
            <th>RP</th><th>Plan</th><th>Last active</th><th></th>
          </tr>
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
              <td class="admin-cell-sub">{{ u.email }}</td>
              <td><span class="sbadge active">{{ u.league }}</span></td>
              <td class="mono">{{ u.rp.toLocaleString() }}</td>
              <td>
                @if (u.premium) {
                  <span class="sbadge premium">Premium</span>
                } @else {
                  <span class="admin-free">Free</span>
                }
              </td>
              <td class="admin-cell-sub">{{ u.last }}</td>
              <td>
                <div class="admin-actions">
                  <button class="btn-micro"><app-icon name="eye" [size]="12" /> Profile</button>
                  @if (store.canDeleteUsers()) {
                    <button class="btn-micro danger"><app-icon name="x" [size]="11" /> Remove</button>
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
export class UsersTabComponent {
  protected readonly store = inject(AdminStore);
}
