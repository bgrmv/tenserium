import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../../model/admin.store';

const CAT_COLOR: Record<string, string> = {
  bug: 'var(--danger)',
  feature_request: 'var(--accent)',
  content: 'var(--warm)',
  other: 'var(--muted)',
};

@Component({
  selector: 'app-admin-feedback-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconComponent],
  template: `
    <div class="admin-filter-row">
      <button class="admin-chip on">All ({{ store.feedback.length }})</button>
      <button class="admin-chip">Unread ({{ store.unreadFeedbackCount() }})</button>
      <button class="admin-chip">Bug</button>
      <button class="admin-chip">Feature</button>
      <button class="admin-chip">Content</button>
    </div>
    @for (f of store.feedback; track f.id) {
      <div [class]="'feedback-card' + (f.read ? '' : ' unread')">
        <div class="fb-head">
          <app-avatar [name]="f.user" [hue]="200" [size]="26" />
          <span class="fb-user">{{ f.user }}</span>
          <span class="fb-cat" [style.color]="catColor(f.cat)" [style.background]="catBg(f.cat)">
            {{ f.cat.replace('_', ' ') }}
          </span>
          <span class="fb-date">{{ f.date }}</span>
          @if (!f.read) {
            <span class="fb-dot"></span>
          }
        </div>
        <div class="fb-msg">{{ f.msg }}</div>
        <div class="fb-actions">
          <button class="btn-micro"><app-icon name="send" [size]="11" /> Reply</button>
          <button class="btn-micro"><app-icon name="check" [size]="11" /> Resolve</button>
        </div>
      </div>
    }
  `,
})
export class FeedbackTabComponent {
  protected readonly store = inject(AdminStore);

  protected catColor(cat: string): string {
    return CAT_COLOR[cat] ?? 'var(--muted)';
  }
  protected catBg(cat: string): string {
    return `color-mix(in oklab,${this.catColor(cat)} 14%,transparent)`;
  }
}
