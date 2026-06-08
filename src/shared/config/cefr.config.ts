import type { TenseId } from './tenses.config';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SubDivision = 1 | 2 | 3 | 4; // I=1 (top) … IV=4 (bottom)
export type League = 'elementary' | 'intermediate' | 'advanced';
export type ScoreSystem = 'ielts' | 'toefl' | 'cambridge' | 'none';

export interface CefrConfig {
  level: CefrLevel;
  league: League;
  descriptor: string;
  ieltsRange: string;
  toeflRange: string;
  cambridgeCert: string | null;
  tensesUnlocked: TenseId[];
}

export const CEFR_LEVELS: CefrConfig[] = [
  {
    level: 'A1',
    league: 'elementary',
    descriptor: 'Beginner',
    ieltsRange: '1.0 – 2.0',
    toeflRange: '0 – 17',
    cambridgeCert: null,
    tensesUnlocked: ['present-simple', 'past-simple'],
  },
  {
    level: 'A2',
    league: 'elementary',
    descriptor: 'Elementary',
    ieltsRange: '2.5 – 3.5',
    toeflRange: '18 – 31',
    cambridgeCert: 'A2 Key',
    tensesUnlocked: ['future-simple', 'present-continuous'],
  },
  {
    level: 'B1',
    league: 'intermediate',
    descriptor: 'Pre-Intermediate',
    ieltsRange: '4.0 – 5.0',
    toeflRange: '32 – 59',
    cambridgeCert: 'B1 Preliminary',
    tensesUnlocked: ['past-continuous', 'present-perfect'],
  },
  {
    level: 'B2',
    league: 'intermediate',
    descriptor: 'Upper-Intermediate',
    ieltsRange: '5.5 – 6.5',
    toeflRange: '60 – 87',
    cambridgeCert: 'B2 First',
    tensesUnlocked: ['past-perfect', 'future-continuous', 'present-perfect-continuous'],
  },
  {
    level: 'C1',
    league: 'advanced',
    descriptor: 'Advanced',
    ieltsRange: '7.0 – 8.0',
    toeflRange: '88 – 109',
    cambridgeCert: 'C1 Advanced',
    tensesUnlocked: ['past-perfect-continuous', 'future-perfect'],
  },
  {
    level: 'C2',
    league: 'advanced',
    descriptor: 'Mastery',
    ieltsRange: '8.5 – 9.0',
    toeflRange: '110 – 120',
    cambridgeCert: 'C2 Proficiency',
    tensesUnlocked: ['future-perfect-continuous'],
  },
];

export const CEFR_MAP = new Map<CefrLevel, CefrConfig>(
  CEFR_LEVELS.map(c => [c.level, c])
);

export const SUBDIVISION_LABELS: Record<SubDivision, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
};

/** Total rank points to fill one sub-division before advancing. */
export const SUBDIV_POINTS_REQUIRED = 100;

/** Number of consecutive losses at sub-div IV to trigger demotion. */
export const DEMOTION_LOSS_THRESHOLD = 3;
