import type { TenseId } from '@shared/types';

/** Three pedagogically meaningful "confusing" tenses for each answer. */
const MAP: Record<TenseId, [TenseId, TenseId, TenseId]> = {
  'present-simple':             ['present-continuous',         'present-perfect',            'past-simple'],
  'present-continuous':         ['present-simple',             'past-continuous',             'present-perfect-continuous'],
  'present-perfect':            ['past-simple',                'present-simple',              'present-perfect-continuous'],
  'present-perfect-continuous': ['present-perfect',            'present-continuous',          'past-perfect-continuous'],
  'past-simple':                ['present-perfect',            'past-continuous',             'past-perfect'],
  'past-continuous':            ['past-simple',                'present-continuous',          'past-perfect-continuous'],
  'past-perfect':               ['past-simple',                'past-continuous',             'past-perfect-continuous'],
  'past-perfect-continuous':    ['past-perfect',               'past-continuous',             'present-perfect-continuous'],
  'future-simple':              ['future-continuous',          'present-simple',              'future-perfect'],
  'future-continuous':          ['future-simple',              'present-continuous',          'future-perfect-continuous'],
  'future-perfect':             ['future-simple',              'future-continuous',           'future-perfect-continuous'],
  'future-perfect-continuous':  ['future-perfect',             'future-continuous',           'past-perfect-continuous'],
};

/** Returns the correct answer + 3 distractors, shuffled. Uses per-question list when provided. */
export function studyChoices(answer: TenseId, distractors?: readonly TenseId[]): TenseId[] {
  const pool: TenseId[] = [answer, ...(distractors ?? MAP[answer])];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
