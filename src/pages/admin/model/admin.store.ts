import { Injectable, computed, effect, signal } from '@angular/core';
import { ADMIN_TABS, ADMIN_TAB_META } from './admin-tabs.config';
import {
  MOCK_USERS, MOCK_REPORTS, MOCK_FEEDBACK, MOCK_QUESTIONS,
  MOCK_AUDIT, MOCK_ANNOUNCEMENTS, MOCK_SESSIONS, MOCK_LIVE_MATCHES,
  MOCK_LEAGUE_SHARES, MOCK_REGISTRATIONS, MOCK_HEATMAP,
} from './admin-mock';
import type { AdminRole, AdminTab, AdminTabId } from './admin.types';

interface RoleMeta {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
}

const ROLE_META: Record<AdminRole, RoleMeta> = {
  support:   { label: 'Support',   color: 'var(--accent)', bg: 'oklch(0.7 0.14 248 / .16)' },
  moderator: { label: 'Moderator', color: 'var(--warm)',   bg: 'oklch(0.8 0.13 62 / .16)'  },
  admin:     { label: 'Admin',     color: 'var(--danger)', bg: 'oklch(0.66 0.2 24 / .16)'  },
};

const EMPTY_META = { title: '', desc: '' } as const;

/**
 * AdminStore — CQRS signal store for the admin panel. Data is mock-backed until
 * Phase 11 wires Supabase; the query/command surface stays unchanged when it does.
 */
@Injectable({ providedIn: 'root' })
export class AdminStore {
  // ── Data (read-only views) ──────────────────────────────
  readonly users = MOCK_USERS;
  readonly reports = MOCK_REPORTS;
  readonly feedback = MOCK_FEEDBACK;
  readonly questions = MOCK_QUESTIONS;
  readonly audit = MOCK_AUDIT;
  readonly announcements = MOCK_ANNOUNCEMENTS;
  readonly sessions = MOCK_SESSIONS;
  readonly liveMatches = MOCK_LIVE_MATCHES;
  readonly leagueShares = MOCK_LEAGUE_SHARES;
  readonly registrations = MOCK_REGISTRATIONS;
  readonly heatmap = MOCK_HEATMAP;

  // ── State ───────────────────────────────────────────────
  private readonly _role = signal<AdminRole>('admin');
  private readonly _activeTabId = signal<AdminTabId>('users');

  // ── Queries ─────────────────────────────────────────────
  readonly role = this._role.asReadonly();

  readonly visibleTabs = computed(() =>
    ADMIN_TABS.filter((t) => t.roles.includes(this._role())),
  );

  readonly activeTab = computed<AdminTab | null>(() => {
    const visible = this.visibleTabs();
    return visible.find((t) => t.id === this._activeTabId()) ?? visible[0] ?? null;
  });

  readonly meta = computed(() => {
    const id = this.activeTab()?.id;
    return id ? ADMIN_TAB_META[id] : EMPTY_META;
  });

  readonly roleMeta = computed(() => ROLE_META[this._role()]);

  readonly canDeleteUsers = computed(() => this._role() === 'admin');
  readonly drafts = computed(() => this.questions.filter((q) => q.status === 'draft'));
  readonly draftCount = computed(() => this.drafts().length);
  readonly openReportCount = computed(() => this.reports.filter((r) => r.status === 'open').length);
  readonly unreadFeedbackCount = computed(() => this.feedback.filter((f) => !f.read).length);

  constructor() {
    // When the active role hides the selected tab, snap the selection to the
    // first visible tab. Kept out of the computed so reads stay pure.
    effect(() => {
      const active = this.activeTab();
      if (active && active.id !== this._activeTabId()) {
        this._activeTabId.set(active.id);
      }
    });
  }

  // ── Commands ────────────────────────────────────────────
  setTab(id: AdminTabId): void {
    this._activeTabId.set(id);
  }

  setRole(role: AdminRole): void {
    this._role.set(role);
  }
}
