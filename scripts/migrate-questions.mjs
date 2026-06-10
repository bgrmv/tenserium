/**
 * Migrates all 12 question JSON files from the legacy flat schema to the
 * extended schema with tokens, tags, LocalizedString prompt, and explanation.
 *
 * Run: node scripts/migrate-questions.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUESTIONS_DIR = join(ROOT, 'src', 'assets', 'questions');

const TENSE_FILES = [
  'present-simple',
  'present-continuous',
  'present-perfect',
  'present-perfect-continuous',
  'past-simple',
  'past-continuous',
  'past-perfect',
  'past-perfect-continuous',
  'future-simple',
  'future-continuous',
  'future-perfect',
  'future-perfect-continuous',
];

const PRONOUNS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them',
]);

const PREPOSITIONS = new Set([
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'of', 'about',
  'after', 'before', 'since', 'until', 'during', 'between', 'into',
  'through', 'over', 'under', 'above', 'below', 'around', 'without',
  'despite', 'along', 'across',
]);

const ADVERBS = new Set([
  'always', 'usually', 'often', 'sometimes', 'never', 'just', 'already',
  'yet', 'still', 'now', 'then', 'ever', 'recently', 'lately', 'soon',
  'today', 'tomorrow', 'yesterday', 'tonight', 'here', 'there',
  'hard', 'well', 'fast', 'loudly', 'quietly', 'quickly', 'slowly',
  'constantly', 'normally', 'regularly', 'currently', 'finally',
  'suddenly', 'immediately', 'hardly', 'barely', 'nearly',
]);

const CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'nor', 'so', 'yet', 'for', 'although', 'because',
  'since', 'while', 'if', 'unless', 'when', 'where', 'that', 'which',
  'who', 'whom', 'whose', 'though', 'even', 'as', 'both', 'either',
  'neither', 'not', 'only',
]);

const DETERMINERS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your',
  'his', 'her', 'its', 'our', 'their', 'some', 'any', 'no', 'every',
  'each', 'all', 'both', 'half', 'either', 'neither', 'much', 'many',
  'more', 'most', 'few', 'little', 'less', 'several', 'enough',
]);

/** Strip trailing punctuation to get the bare word for lookups */
function bareWord(token) {
  return token.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
}

/** Determine whether a token string ends with punctuation only */
function endsWithPunctuation(token) {
  return /[.,!?;:'")\]]$/.test(token);
}

/**
 * Split a full sentence string into raw token strings,
 * keeping punctuation attached to the preceding word.
 */
function tokenize(full) {
  return (full.match(/\S+/g) ?? []);
}

/**
 * Build a set of bare words that are part of the verb phrase
 * so we can mark them as 'keyword'.
 */
function verbWordSet(verbPhrase) {
  if (!verbPhrase) return new Set();
  return new Set(verbPhrase.trim().split(/\s+/).map((w) => bareWord(w)));
}

/**
 * Assign a TokenCategory to a raw token string.
 * keywordSet contains bare words that belong to the verb phrase.
 */
function categorize(token, keywordSet, isFirstToken) {
  const bare = bareWord(token);

  if (keywordSet.has(bare)) return 'keyword';
  if (PRONOUNS.has(bare)) return 'pronoun';
  if (PREPOSITIONS.has(bare)) return 'preposition';
  if (ADVERBS.has(bare)) return 'adverb';
  if (CONJUNCTIONS.has(bare)) return 'other';
  if (DETERMINERS.has(bare)) return 'other';

  // Proper noun heuristic: starts uppercase and is not sentence-initial
  if (!isFirstToken && /^[A-Z]/.test(token) && bare.length > 0) return 'noun';

  // -ly suffix → likely adverb (already covered by ADVERBS set for common ones,
  // this catches long-tail words)
  if (bare.endsWith('ly')) return 'adverb';

  // Default to 'other' — editors can refine individual questions
  return 'other';
}

function buildTokens(full, verbPhrase) {
  const rawTokens = tokenize(full);
  const keys = verbWordSet(verbPhrase);

  return rawTokens.map((token, idx) => ({
    text: token,
    category: categorize(token, keys, idx === 0),
  }));
}

function buildTags(question, full) {
  const tags = [];

  // Grammar topic
  tags.push(question.answer);

  // Mechanism sub-type
  tags.push(question.type === 'context' ? 'context-clue' : 'sentence-analysis');

  // Sentence structure
  if (full.includes('?')) {
    tags.push('question');
  } else if (full.includes("n't") || / not /.test(full)) {
    tags.push('negative');
  } else {
    tags.push('affirmative');
  }

  // Aspect tags (derived from tense id)
  const answer = question.answer;
  if (answer.includes('perfect-continuous')) tags.push('perfect-continuous');
  else if (answer.includes('perfect')) tags.push('perfect');
  else if (answer.includes('continuous')) tags.push('continuous');
  else tags.push('simple');

  // Difficulty
  tags.push(`difficulty-${question.difficulty}`);

  return tags;
}

function migrateQuestion(q) {
  const pre = q.sentence.pre ?? '';
  const verb = q.sentence.verb ?? '';
  const post = q.sentence.post ?? '';
  const full = `${pre}${verb}${post}`;

  return {
    id: q.id,
    answer: q.answer,
    mechanism: 'context',   // all existing questions share this mechanic
    prompt: {
      ru: q.prompt,
      en: q.promptEn ?? q.prompt,
    },
    explanation: {
      ru: '',
      en: '',
    },
    sentence: {
      full,
      tokens: buildTokens(full, verb),
      pre: q.sentence.pre,
      verb: q.sentence.verb,
      post: q.sentence.post,
    },
    tags: buildTags(q, full),
    difficulty: q.difficulty,
  };
}

let totalMigrated = 0;

for (const tense of TENSE_FILES) {
  const filePath = join(QUESTIONS_DIR, `${tense}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const questions = JSON.parse(raw);

  const migrated = questions.map(migrateQuestion);
  writeFileSync(filePath, JSON.stringify(migrated, null, 2) + '\n', 'utf-8');

  console.log(`✓ ${tense}.json — ${migrated.length} questions migrated`);
  totalMigrated += migrated.length;
}

console.log(`\nDone. Total: ${totalMigrated} questions across ${TENSE_FILES.length} files.`);
