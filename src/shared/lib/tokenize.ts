import type { Token } from '@shared/types';

// words-with-contractions | single punctuation char | whitespace run
const PATTERN = /[A-Za-z0-9]+(?:['''][A-Za-z]+)*|[^\w\s]|\s+/g;

export function tokenize(str: string): Token[] {
  return (str.match(PATTERN) ?? []).map(v => ({
    type: /^\s+$/.test(v) ? 'space' : /^\W$/.test(v) ? 'punct' : 'word',
    value: v,
  })) as Token[];
}

export function tokenizeSentence(pre: string, verb: string, post: string): Token[] {
  return [
    ...tokenize(pre),
    ...tokenize(verb).map(t => ({ ...t, role: 'verb' as const })),
    ...tokenize(post),
  ];
}
