import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../../model/admin.store';

@Component({
  selector: 'app-admin-announce-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="admin-card">
      <div class="admin-card-title">New announcement</div>
      <textarea class="admin-input area" rows="3"
                placeholder="Announcement visible to all users on next load…"></textarea>
      <div class="announce-pub">
        <label class="admin-form-label" style="white-space:nowrap" for="ann-expires">Expires</label>
        <input id="ann-expires" class="admin-input" type="date" value="2026-06-21" />
        <button class="btn-primary sm"><app-icon name="send" [size]="12" /> Publish</button>
      </div>
    </div>
    <div class="admin-list-title">Active &amp; recent</div>
    @for (a of store.announcements; track a.id) {
      <div [class]="'ann-card' + (a.active ? ' live' : '')">
        <div class="ann-card-main">
          <div class="ann-text">{{ a.text }}</div>
          <div class="ann-meta">Created {{ a.created }} · expires {{ a.expires }}</div>
        </div>
        <span [class]="'sbadge ' + (a.active ? 'active' : 'resolved')">{{ a.active ? 'Live' : 'Expired' }}</span>
        @if (a.active) {
          <button class="btn-micro danger"><app-icon name="x" [size]="11" /> Deactivate</button>
        }
      </div>
    }
  `,
})
export class AnnounceTabComponent {
  protected readonly store = inject(AdminStore);
}
