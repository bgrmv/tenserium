import type { AdminTab, AdminTabId } from './admin.types';

export const ADMIN_TABS: readonly AdminTab[] = [
  { id: 'users',      label: 'Users',               ico: 'squad',    roles: ['moderator', 'admin'],           badge: null  },
  { id: 'activity',   label: 'Live Activity',        ico: 'bolt',     roles: ['moderator', 'admin'],           badge: 'live' },
  { id: 'stats',      label: 'Statistics',           ico: 'stats',    roles: ['moderator', 'admin'],           badge: null  },
  { id: 'content',    label: 'Content Review',       ico: 'learn',    roles: ['moderator', 'admin'],           badge: null  },
  { id: 'aigen',      label: 'AI Generation',        ico: 'zap',      roles: ['moderator', 'admin'],           badge: null  },
  { id: 'reports',    label: 'Error Reports',        ico: 'flag',     roles: ['support', 'moderator', 'admin'], badge: 5   },
  { id: 'moderation', label: 'Account Moderation',   ico: 'shield',   roles: ['moderator', 'admin'],           badge: null  },
  { id: 'feedback',   label: 'Support / Feedback',   ico: 'chat',     roles: ['support', 'moderator', 'admin'], badge: 3   },
  { id: 'audit',      label: 'Audit Log',            ico: 'clock',    roles: ['admin'],                         badge: null  },
  { id: 'daily',      label: 'Daily Challenge',      ico: 'calendar', roles: ['moderator', 'admin'],           badge: null  },
  { id: 'announce',   label: 'Announcements',        ico: 'globe',    roles: ['moderator', 'admin'],           badge: null  },
];

export const ADMIN_TAB_META: Record<AdminTabId, { title: string; desc: string }> = {
  users:      { title: 'Users',                   desc: 'Browse, search and manage user accounts.' },
  activity:   { title: 'Live Activity',           desc: 'Real-time overview of active sessions and rank matches.' },
  stats:      { title: 'Statistics',              desc: 'Platform metrics — DAU/WAU/MAU, accuracy heatmap, league distribution.' },
  content:    { title: 'Content Review',          desc: 'Review, edit and calibrate question difficulty.' },
  aigen:      { title: 'AI Question Generation',  desc: 'Generate new questions via Claude. Drafts require manual approval.' },
  reports:    { title: 'Error Reports',           desc: 'User-submitted question errors — review and resolve.' },
  moderation: { title: 'Account Moderation',      desc: 'Warnings, suspensions, bans and rank point adjustments.' },
  feedback:   { title: 'Support / Feedback',      desc: 'Support inbox — bugs, feature requests, content issues.' },
  audit:      { title: 'Audit Log',               desc: 'Immutable record of all admin actions. Read-only.' },
  daily:      { title: 'Daily Challenge Override', desc: 'Manually curate question sets for specific dates.' },
  announce:   { title: 'System Announcements',    desc: 'Publish dismissible banners shown to all users.' },
};
