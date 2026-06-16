import type { IconName } from '@shared/ui/icon/icon.component';
import type { TenseId } from '@shared/config/tenses.config';

export type AdminRole = 'support' | 'moderator' | 'admin';

export type AdminTabId =
  | 'users' | 'activity' | 'stats' | 'content' | 'aigen'
  | 'reports' | 'moderation' | 'feedback' | 'audit' | 'daily' | 'announce';

export interface AdminTab {
  readonly id: AdminTabId;
  readonly label: string;
  readonly ico: IconName;
  readonly roles: readonly AdminRole[];
  readonly badge: number | 'live' | null;
}

export type AccountStatus = 'active' | 'banned';

export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly league: string;
  readonly rp: number;
  readonly premium: boolean;
  readonly status: AccountStatus;
  readonly last: string;
}

export interface AdminReport {
  readonly id: string;
  readonly qid: string;
  readonly reporter: string;
  readonly desc: string;
  readonly date: string;
  readonly status: 'open' | 'resolved' | 'dismissed';
}

export interface AdminFeedback {
  readonly id: string;
  readonly cat: 'bug' | 'feature_request' | 'content' | 'other';
  readonly user: string;
  readonly msg: string;
  readonly date: string;
  readonly read: boolean;
}

export interface AdminQuestion {
  readonly id: string;
  readonly tense: TenseId;
  readonly diff: 1 | 2 | 3;
  readonly type: 'sentence' | 'context';
  readonly flagged: number;
  readonly accuracy: number | null;
  readonly status: 'active' | 'draft' | 'pending_review' | 'archived';
  /** Sample prompt — present for AI-generated drafts awaiting review. */
  readonly prompt?: string;
}

export interface AdminAuditEntry {
  readonly ts: string;
  readonly admin: string;
  readonly action: string;
  readonly target: string;
  readonly reason: string;
}

export interface AdminAnnouncement {
  readonly id: string;
  readonly text: string;
  readonly active: boolean;
  readonly created: string;
  readonly expires: string;
}

export interface AdminSession {
  readonly name: string;
  readonly mode: string;
  readonly q: number;
  readonly score: number;
}

export interface AdminLiveMatch {
  readonly id: string;
  readonly players: readonly string[];
  readonly q: number;
}

export interface LeagueShare {
  readonly name: string;
  readonly pct: number;
  readonly color: string;
}

export interface RegistrationBar {
  readonly label: string;
  readonly heightPct: number;
}
