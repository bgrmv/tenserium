import type { RankProgress, RankTier } from '@shared/types';

interface RankTierConfig {
  readonly key: RankTier;
  readonly label: string;
  readonly metal: string;
  readonly min: number;
}

export const RANK_TIERS: readonly RankTierConfig[] = [
  { key: 'rookie',      label: 'Rookie',      metal: '#c08457', min: 0 },
  { key: 'scholar',     label: 'Scholar',     metal: '#d9b44a', min: 1200 },
  { key: 'expert',      label: 'Expert',      metal: '#b9c2cc', min: 3000 },
  { key: 'master',      label: 'Master',      metal: '#6fd3c7', min: 6000 },
  { key: 'grandmaster', label: 'Grandmaster', metal: '#e2b3ff', min: 10_000 },
];

const BY_KEY = new Map(RANK_TIERS.map((t) => [t.key, t]));

export function rankTier(key: RankTier): RankTierConfig {
  const t = BY_KEY.get(key);
  if (!t) throw new Error(`Unknown rank tier: ${key}`);
  return t;
}

export function rankProgress(points: number): RankProgress {
  let current = RANK_TIERS[0];
  let next: RankTierConfig | undefined;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (points >= RANK_TIERS[i].min) {
      current = RANK_TIERS[i];
      next = RANK_TIERS[i + 1];
    }
  }
  const ceiling = next ? next.min : current.min + 4000;
  return {
    tier: current.key,
    points,
    intoTier: points - current.min,
    tierSize: ceiling - current.min,
  };
}
