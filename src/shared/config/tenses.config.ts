export type TenseId =
  | 'present-simple'
  | 'present-continuous'
  | 'present-perfect'
  | 'present-perfect-continuous'
  | 'past-simple'
  | 'past-continuous'
  | 'past-perfect'
  | 'past-perfect-continuous'
  | 'future-simple'
  | 'future-continuous'
  | 'future-perfect'
  | 'future-perfect-continuous';

export type Aspect = 'simple' | 'continuous' | 'perfect' | 'perfect-continuous';
export type TimePeriod = 'present' | 'past' | 'future';

export interface TenseConfig {
  readonly id: TenseId;
  readonly hotkey: `F${number}`;
  readonly order: number;
  readonly aspect: Aspect;
  readonly time: TimePeriod;
  readonly name: string;
}

/**
 * Canonical tense list. Order is row-major by time period
 * (Present F1–F4, Past F5–F8, Future F9–F12); within each period the aspect
 * order is Simple, Continuous, Perfect, Perfect Continuous.
 * In a 4-column grid this lays out as the 3×4 matrix used by the home page.
 * So F7 = Past Perfect.
 */
export const TENSES: readonly TenseConfig[] = [
  { id: 'present-simple',              hotkey: 'F1',  order: 1,  aspect: 'simple',              time: 'present', name: 'Present Simple' },
  { id: 'present-continuous',          hotkey: 'F2',  order: 2,  aspect: 'continuous',           time: 'present', name: 'Present Continuous' },
  { id: 'present-perfect',             hotkey: 'F3',  order: 3,  aspect: 'perfect',              time: 'present', name: 'Present Perfect' },
  { id: 'present-perfect-continuous',  hotkey: 'F4',  order: 4,  aspect: 'perfect-continuous',   time: 'present', name: 'Present Perfect Continuous' },
  { id: 'past-simple',                 hotkey: 'F5',  order: 5,  aspect: 'simple',               time: 'past',    name: 'Past Simple' },
  { id: 'past-continuous',             hotkey: 'F6',  order: 6,  aspect: 'continuous',            time: 'past',    name: 'Past Continuous' },
  { id: 'past-perfect',                hotkey: 'F7',  order: 7,  aspect: 'perfect',               time: 'past',    name: 'Past Perfect' },
  { id: 'past-perfect-continuous',     hotkey: 'F8',  order: 8,  aspect: 'perfect-continuous',    time: 'past',    name: 'Past Perfect Continuous' },
  { id: 'future-simple',               hotkey: 'F9',  order: 9,  aspect: 'simple',               time: 'future',  name: 'Future Simple' },
  { id: 'future-continuous',           hotkey: 'F10', order: 10, aspect: 'continuous',            time: 'future',  name: 'Future Continuous' },
  { id: 'future-perfect',              hotkey: 'F11', order: 11, aspect: 'perfect',               time: 'future',  name: 'Future Perfect' },
  { id: 'future-perfect-continuous',   hotkey: 'F12', order: 12, aspect: 'perfect-continuous',    time: 'future',  name: 'Future Perfect Continuous' },
];

export const ASPECT_ORDER: readonly Aspect[] = ['simple', 'continuous', 'perfect', 'perfect-continuous'];
export const TIME_ORDER: readonly TimePeriod[] = ['present', 'past', 'future'];

export const ASPECT_LABEL: Record<Aspect, string> = {
  simple: 'Simple',
  continuous: 'Continuous',
  perfect: 'Perfect',
  'perfect-continuous': 'Perfect Continuous',
};

const BY_ID = new Map<TenseId, TenseConfig>(TENSES.map((t) => [t.id, t]));

export function getTense(id: TenseId): TenseConfig {
  const t = BY_ID.get(id);
  if (!t) throw new Error(`Unknown tense: ${id}`);
  return t;
}

export function tensesByTime(time: TimePeriod): readonly TenseConfig[] {
  return TENSES.filter((t) => t.time === time);
}

export function hotkeyToTense(n: number): TenseConfig | undefined {
  return TENSES.find((t) => t.order === n);
}
