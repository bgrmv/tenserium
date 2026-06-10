import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// words-with-contractions | single punctuation char | whitespace run
const PATTERN = /[A-Za-z0-9]+(?:['''][A-Za-z]+)*|[^\w\s]|\s+/g;

function tokenize(str) {
  return (str.match(PATTERN) ?? []).map(v => ({
    type: /^\s+$/.test(v) ? 'space' : /^\W$/.test(v) ? 'punct' : 'word',
    value: v,
  }));
}

function tokenizeSentence(pre, verb, post) {
  return [
    ...tokenize(pre),
    ...tokenize(verb).map(t => ({ ...t, role: 'verb' })),
    ...tokenize(post),
  ];
}

const dir = 'src/assets/questions';
for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const path = join(dir, file);
  const questions = JSON.parse(readFileSync(path, 'utf8'));

  for (const q of questions) {
    for (const s of q.sentences) {
      if (Array.isArray(s.pre)) {
        // Already token arrays from previous migration — flatten with role
        s.tokens = [
          ...s.pre,
          ...s.verb.map(t => ({ ...t, role: 'verb' })),
          ...s.post,
        ];
      } else {
        // Plain strings — tokenize from scratch
        s.tokens = tokenizeSentence(s.pre, s.verb, s.post);
      }
      delete s.pre;
      delete s.verb;
      delete s.post;
    }
  }

  writeFileSync(path, JSON.stringify(questions, null, 2) + '\n');
  console.log('migrated', file);
}
