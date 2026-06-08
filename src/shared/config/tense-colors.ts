import type { Aspect, TenseConfig, TimePeriod } from '@shared/config/tenses.config';
import { TENSES } from '@shared/config/tenses.config';
import type { TenseId } from '@shared/config/tenses.config';

/**
 * Tense color system. Three interchangeable palettes, all built in oklch so
 * lightness/chroma stay perceptually even:
 *  - 'aspect'   — one hue family per aspect (columns of the matrix share a hue)
 *  - 'time'     — one hue family per time period (rows of the matrix share a hue)
 *  - 'spectrum' — even rainbow by grid order
 *
 * Mirrors the Phase-14 `--tense-{id}` token plan: call {@link tenseCssVars}
 * to materialise the active palette as CSS custom properties on :root.
 */
export type PaletteMode = 'aspect' | 'time' | 'spectrum';

interface HueFamily {
  readonly hue: number;
  readonly chroma: number;
}

const ASPECT_FAMILY: Record<Aspect, HueFamily> = {
  simple: { hue: 162, chroma: 0.13 },
  continuous: { hue: 248, chroma: 0.15 },
  perfect: { hue: 305, chroma: 0.15 },
  'perfect-continuous': { hue: 52, chroma: 0.13 },
};

const TIME_LIGHTNESS: Record<TimePeriod, number> = {
  present: 0.7,
  past: 0.6,
  future: 0.8,
};

const TIME_HUE: Record<TimePeriod, number> = {
  present: 150,
  past: 28,
  future: 255,
};

const ASPECT_LIGHTNESS: Record<Aspect, number> = {
  simple: 0.74,
  continuous: 0.67,
  perfect: 0.6,
  'perfect-continuous': 0.53,
};

export function tenseColor(tense: TenseConfig, palette: PaletteMode = 'aspect'): string {
  switch (palette) {
    case 'spectrum': {
      const hue = Math.round(((tense.order - 1) / 12) * 320 + 20);
      return `oklch(0.7 0.15 ${hue})`;
    }
    case 'time': {
      return `oklch(${ASPECT_LIGHTNESS[tense.aspect]} 0.14 ${TIME_HUE[tense.time]})`;
    }
    case 'aspect':
    default: {
      const fam = ASPECT_FAMILY[tense.aspect];
      return `oklch(${TIME_LIGHTNESS[tense.time]} ${fam.chroma} ${fam.hue})`;
    }
  }
}

/** `{ '--tense-present-simple': 'oklch(...)', … }` for the active palette. */
export function tenseCssVars(palette: PaletteMode = 'aspect'): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const t of TENSES) vars[`--tense-${t.id}`] = tenseColor(t, palette);
  return vars;
}

export function colorVarRef(id: TenseId): string {
  return `var(--tense-${id})`;
}
