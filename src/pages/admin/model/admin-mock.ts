import type {
  AdminUser, AdminReport, AdminFeedback, AdminQuestion,
  AdminAuditEntry, AdminAnnouncement, AdminSession, AdminLiveMatch,
  LeagueShare, RegistrationBar,
} from './admin.types';

export const MOCK_USERS: readonly AdminUser[] = [
  { id: 'u1', name: 'Alisa K.',    email: 'alisa@mail.ru',   league: 'Expert',      rp: 3840,  premium: true,  status: 'active', last: '2026-06-14' },
  { id: 'u2', name: 'Pavel M.',    email: 'pmike@gmail.com', league: 'Scholar',     rp: 1420,  premium: false, status: 'active', last: '2026-06-13' },
  { id: 'u3', name: 'Tenso_Bot',   email: 'bot@test.com',    league: 'Rookie',      rp: 80,    premium: false, status: 'banned', last: '2026-06-10' },
  { id: 'u4', name: 'YanaLearn',   email: 'yana@yandex.ru',  league: 'Master',      rp: 6280,  premium: true,  status: 'active', last: '2026-06-14' },
  { id: 'u5', name: 'Igor_Dev',    email: 'igor@dev.io',     league: 'Grandmaster', rp: 11200, premium: true,  status: 'active', last: '2026-06-12' },
  { id: 'u6', name: 'Sasha_N.',    email: 'sasha@mail.ru',   league: 'Scholar',     rp: 2100,  premium: false, status: 'active', last: '2026-06-09' },
  { id: 'u7', name: 'ElenaTenses', email: 'elena@edu.ru',    league: 'Expert',      rp: 4100,  premium: false, status: 'active', last: '2026-06-11' },
];

export const MOCK_REPORTS: readonly AdminReport[] = [
  { id: 'r1', qid: 'q-ps-01', reporter: 'Pavel M.',  desc: 'Wrong answer accepted — Past Simple instead of Present Simple',     date: '2026-06-13', status: 'open'      },
  { id: 'r2', qid: 'q-pc-07', reporter: 'Alisa K.',  desc: 'Ambiguous sentence — could be Pres.Perf.Cont. or Past Perf.Cont.', date: '2026-06-12', status: 'open'      },
  { id: 'r3', qid: 'q-fs-03', reporter: 'YanaLearn', desc: 'Formula says "will+V" but expected answer is Future Continuous',    date: '2026-06-11', status: 'open'      },
  { id: 'r4', qid: 'q-pp-02', reporter: 'Igor_Dev',  desc: 'Typo in option label — Pefect instead of Perfect',                  date: '2026-06-10', status: 'resolved'  },
  { id: 'r5', qid: 'q-pr-01', reporter: 'Sasha_N.',  desc: 'Prompt is unclear without full sentence context',                   date: '2026-06-09', status: 'open'      },
  { id: 'r6', qid: 'q-cs-05', reporter: 'Elena T.',  desc: 'Present Continuous expected but Past Continuous also accepted',     date: '2026-06-08', status: 'dismissed' },
  { id: 'r7', qid: 'q-fp-11', reporter: 'Pavel M.',  desc: 'Future Perfect reads like a conditional clause',                   date: '2026-06-08', status: 'open'      },
];

export const MOCK_FEEDBACK: readonly AdminFeedback[] = [
  { id: 'f1', cat: 'bug',             user: 'Pavel M.',    msg: 'App freezes on Firefox when pressing F12 during a game.',              date: '2026-06-14', read: false },
  { id: 'f2', cat: 'feature_request', user: 'YanaLearn',   msg: 'Could you add a dark/light toggle? Screen is too bright in lectures.', date: '2026-06-13', read: false },
  { id: 'f3', cat: 'content',         user: 'Alisa K.',    msg: 'Pres.Perf.Cont. learn page is missing negative form examples.',        date: '2026-06-12', read: true  },
  { id: 'f4', cat: 'bug',             user: 'Sasha_N.',    msg: 'On mobile, answer grid overlaps the timer bar on small screens.',      date: '2026-06-11', read: false },
  { id: 'f5', cat: 'other',           user: 'ElenaTenses', msg: 'Love this app! Using it with students — any teacher dashboard?',       date: '2026-06-10', read: true  },
];

export const MOCK_QUESTIONS: readonly AdminQuestion[] = [
  { id: 'q-ps-01', tense: 'present-simple',             diff: 1, type: 'sentence', flagged: 3, accuracy: 0.91, status: 'active'         },
  { id: 'q-pc-07', tense: 'present-perfect-continuous', diff: 3, type: 'context',  flagged: 2, accuracy: 0.58, status: 'active'         },
  { id: 'q-fs-03', tense: 'future-simple',              diff: 1, type: 'sentence', flagged: 2, accuracy: 0.87, status: 'active'         },
  { id: 'q-pp-02', tense: 'past-perfect',               diff: 2, type: 'sentence', flagged: 0, accuracy: 0.73, status: 'active'         },
  { id: 'q-pr-01', tense: 'present-continuous',         diff: 2, type: 'context',  flagged: 1, accuracy: 0.84, status: 'pending_review' },
  { id: 'q-ai-01', tense: 'past-simple',                diff: 1, type: 'sentence', flagged: 0, accuracy: null, status: 'draft', prompt: 'Yesterday she ___ the report before he called.' },
  { id: 'q-ai-02', tense: 'future-perfect',             diff: 3, type: 'context',  flagged: 0, accuracy: null, status: 'draft', prompt: 'By next June, they ___ the entire course.' },
];

export const MOCK_AUDIT: readonly AdminAuditEntry[] = [
  { ts: '2026-06-13 14:32', admin: 'Igor_Dev',  action: 'warning_issued',    target: 'Pavel M.',  reason: 'Offensive username in match chat'        },
  { ts: '2026-06-12 09:15', admin: 'Igor_Dev',  action: 'ban_permanent',     target: 'Tenso_Bot', reason: 'Automated spam account detected'         },
  { ts: '2026-06-11 17:45', admin: 'YanaLearn', action: 'question_edited',   target: 'q-pc-07',   reason: 'Clarified ambiguous prompt text'         },
  { ts: '2026-06-10 11:00', admin: 'Igor_Dev',  action: 'rank_adjusted',     target: 'Sasha_N.',  reason: 'Points correction +200 rp'               },
  { ts: '2026-06-09 16:22', admin: 'YanaLearn', action: 'question_approved', target: 'q-ai-01',   reason: 'Reviewed and content is correct'         },
];

export const MOCK_ANNOUNCEMENTS: readonly AdminAnnouncement[] = [
  { id: 'a1', text: 'Maintenance window June 18 22:00-23:00 UTC. Brief downtime expected.', active: true,  created: '2026-06-14', expires: '2026-06-18' },
  { id: 'a2', text: 'Future tenses are now fully unlocked for all users!',                  active: false, created: '2026-06-01', expires: '2026-06-10' },
];

export const MOCK_SESSIONS: readonly AdminSession[] = [
  { name: 'YanaLearn',   mode: 'Rank',   q: 7,  score: 680 },
  { name: 'Alisa K.',    mode: 'Squad',  q: 4,  score: 340 },
  { name: 'Sasha_N.',    mode: 'Normal', q: 11, score: 920 },
  { name: 'Pavel M.',    mode: 'Daily',  q: 3,  score: 240 },
  { name: 'ElenaTenses', mode: 'Rank',   q: 9,  score: 760 },
];

export const MOCK_LIVE_MATCHES: readonly AdminLiveMatch[] = [
  { id: 'm1', players: ['YanaLearn', 'Lexa', 'Verbo', 'Tenso'],   q: 7  },
  { id: 'm2', players: ['Alisa K.', 'Pavel M.', 'Lexa', 'Tenso'], q: 4  },
  { id: 'm3', players: ['Igor_Dev', 'Verbo', 'Lexa', 'Tenso'],    q: 11 },
];

export const MOCK_LEAGUE_SHARES: readonly LeagueShare[] = [
  { name: 'Rookie',      pct: 32, color: '#c08457' },
  { name: 'Scholar',     pct: 28, color: '#d9b44a' },
  { name: 'Expert',      pct: 22, color: '#b9c2cc' },
  { name: 'Master',      pct: 13, color: '#6fd3c7' },
  { name: 'Grandmaster', pct: 5,  color: '#e2b3ff' },
];

const REG_RAW: readonly [string, number][] = [
  ['M', 24], ['T', 31], ['W', 19], ['T', 42], ['F', 38], ['S', 55], ['S', 47],
];
const REG_MAX = Math.max(...REG_RAW.map(([, v]) => v));

export const MOCK_REGISTRATIONS: readonly RegistrationBar[] = REG_RAW.map(
  ([label, v]) => ({ label, heightPct: Math.round((v / REG_MAX) * 100) }),
);

export const MOCK_HEATMAP: Readonly<Record<string, number>> = {
  'present-simple': 94, 'present-continuous': 88, 'present-perfect': 79, 'present-perfect-continuous': 64,
  'past-simple': 91,    'past-continuous': 83,    'past-perfect': 72,    'past-perfect-continuous': 58,
  'future-simple': 89,  'future-continuous': 76,  'future-perfect': 67,  'future-perfect-continuous': 52,
};
