import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AdminStore } from '../model/admin.store';
import type { AdminRole } from '../model/admin.types';

import { UsersTabComponent } from './tabs/users-tab.component';
import { ActivityTabComponent } from './tabs/activity-tab.component';
import { StatsTabComponent } from './tabs/stats-tab.component';
import { ContentTabComponent } from './tabs/content-tab.component';
import { AigenTabComponent } from './tabs/aigen-tab.component';
import { ReportsTabComponent } from './tabs/reports-tab.component';
import { ModerationTabComponent } from './tabs/moderation-tab.component';
import { FeedbackTabComponent } from './tabs/feedback-tab.component';
import { AuditTabComponent } from './tabs/audit-tab.component';
import { DailyTabComponent } from './tabs/daily-tab.component';
import { AnnounceTabComponent } from './tabs/announce-tab.component';

const ROLES: readonly AdminRole[] = ['support', 'moderator', 'admin'];

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    UsersTabComponent, ActivityTabComponent, StatsTabComponent,
    ContentTabComponent, AigenTabComponent, ReportsTabComponent,
    ModerationTabComponent, FeedbackTabComponent, AuditTabComponent,
    DailyTabComponent, AnnounceTabComponent,
  ],
  templateUrl: './admin.page.html',
})
export class AdminPageComponent {
  protected readonly store = inject(AdminStore);
  protected readonly roles = ROLES;

  protected onRoleChange(value: string): void {
    if ((ROLES as readonly string[]).includes(value)) {
      this.store.setRole(value as AdminRole);
    }
  }
}
