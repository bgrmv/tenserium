import {
  CEFR_MAP,
  CEFR_LEVELS,
  SUBDIVISION_LABELS,
  type CefrLevel,
  type SubDivision,
  type ScoreSystem,
  type League,
} from '../config/cefr.config';

/** Returns the display label for a division, e.g. "B2-III" */
export function getSubDivLabel(level: CefrLevel, subDiv: SubDivision): string {
  return `${level}-${SUBDIVISION_LABELS[subDiv]}`;
}

/** Returns the equivalent score string for the chosen display system, e.g. "~6.0 – 6.5" */
export function getEquivalent(level: CefrLevel, system: ScoreSystem): string {
  if (system === 'none') return '';
  const config = CEFR_MAP.get(level);
  if (!config) return '';
  switch (system) {
    case 'ielts': return `~IELTS ${config.ieltsRange}`;
    case 'toefl': return `~TOEFL ${config.toeflRange}`;
    case 'cambridge': return config.cambridgeCert ?? '—';
  }
}

/** Returns the league for a given CEFR level. */
export function getLeagueForCefr(level: CefrLevel): League {
  return CEFR_MAP.get(level)!.league;
}

/**
 * Returns the next CEFR level and sub-division after advancing from the given position.
 * Returns null if already at the top (C2-I).
 */
export function getNextPosition(
  level: CefrLevel,
  subDiv: SubDivision
): { level: CefrLevel; subDiv: SubDivision } | null {
  if (subDiv > 1) {
    return { level, subDiv: (subDiv - 1) as SubDivision };
  }
  const idx = CEFR_LEVELS.findIndex(c => c.level === level);
  if (idx === -1 || idx === CEFR_LEVELS.length - 1) return null;
  return { level: CEFR_LEVELS[idx + 1].level, subDiv: 4 };
}

/**
 * Returns the previous position after demotion.
 * Returns null if already at the bottom (A1-IV).
 */
export function getPrevPosition(
  level: CefrLevel,
  subDiv: SubDivision
): { level: CefrLevel; subDiv: SubDivision } | null {
  if (subDiv < 4) {
    return { level, subDiv: (subDiv + 1) as SubDivision };
  }
  const idx = CEFR_LEVELS.findIndex(c => c.level === level);
  if (idx <= 0) return null;
  return { level: CEFR_LEVELS[idx - 1].level, subDiv: 1 };
}

/**
 * Returns all tenses available at a given CEFR level (cumulative — includes lower levels).
 */
import type { TenseId } from '../config/tenses.config';

export function getAvailableTenses(level: CefrLevel): TenseId[] {
  const idx = CEFR_LEVELS.findIndex(c => c.level === level);
  return CEFR_LEVELS.slice(0, idx + 1).flatMap(c => c.tensesUnlocked);
}
