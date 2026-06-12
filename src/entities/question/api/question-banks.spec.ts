import { describe, expect, it } from 'vitest';
import type { Question, TenseId } from '@shared/types';
import { TENSES } from '@shared/config/tenses.config';

import presentSimple from '../../../assets/questions/present-simple.json';
import presentContinuous from '../../../assets/questions/present-continuous.json';
import presentPerfect from '../../../assets/questions/present-perfect.json';
import presentPerfectContinuous from '../../../assets/questions/present-perfect-continuous.json';
import pastSimple from '../../../assets/questions/past-simple.json';
import pastContinuous from '../../../assets/questions/past-continuous.json';
import pastPerfect from '../../../assets/questions/past-perfect.json';
import pastPerfectContinuous from '../../../assets/questions/past-perfect-continuous.json';
import futureSimple from '../../../assets/questions/future-simple.json';
import futureContinuous from '../../../assets/questions/future-continuous.json';
import futurePerfect from '../../../assets/questions/future-perfect.json';
import futurePerfectContinuous from '../../../assets/questions/future-perfect-continuous.json';

const BANKS: ReadonlyMap<TenseId, readonly Question[]> = new Map([
  ['present-simple', presentSimple],
  ['present-continuous', presentContinuous],
  ['present-perfect', presentPerfect],
  ['present-perfect-continuous', presentPerfectContinuous],
  ['past-simple', pastSimple],
  ['past-continuous', pastContinuous],
  ['past-perfect', pastPerfect],
  ['past-perfect-continuous', pastPerfectContinuous],
  ['future-simple', futureSimple],
  ['future-continuous', futureContinuous],
  ['future-perfect', futurePerfect],
  ['future-perfect-continuous', futurePerfectContinuous],
] as unknown as [TenseId, Question[]][]);

const TENSE_IDS = new Set<string>(TENSES.map((t) => t.id));
const MECHANISMS = new Set(['context', 'match', 'fill-in', 'multiple-choice']);
const TOKEN_TYPES = new Set(['word', 'punct', 'space']);

/** MT/markup artefacts that must never reach players. */
const HTML_ENTITY = /&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/;
const MARKUP = /<[a-zA-Z/]|\{\d+>/;
const PLACEHOLDER = /^[\s\-_.,;:?^=]+$/;

function lintText(text: string, where: string, errors: string[]): void {
  if (HTML_ENTITY.test(text)) errors.push(`${where}: HTML entity in "${text}"`);
  if (MARKUP.test(text)) errors.push(`${where}: markup leak in "${text}"`);
}

function lintRussian(text: string, where: string, errors: string[]): void {
  lintText(text, where, errors);
  if (PLACEHOLDER.test(text)) errors.push(`${where}: placeholder junk "${text}"`);
  if (!/[а-яА-ЯёЁ]/.test(text)) errors.push(`${where}: no Cyrillic in ru text "${text}"`);
  if (/[,;:]\s*$/.test(text)) errors.push(`${where}: trailing punctuation in "${text}"`);
  if (text !== text.trim()) errors.push(`${where}: leading/trailing whitespace in "${text}"`);
}

function sentenceText(q: Question, idx: number): string {
  return q.sentences[idx].tokens.map((t) => t.value).join('');
}

describe('question banks', () => {
  it('covers all 12 tenses', () => {
    expect(BANKS.size).toBe(12);
    for (const t of TENSES) expect(BANKS.has(t.id), t.id).toBe(true);
  });

  it('has globally unique question ids', () => {
    const seen = new Map<string, TenseId>();
    const dupes: string[] = [];
    for (const [tense, bank] of BANKS) {
      for (const q of bank) {
        if (seen.has(q.id)) dupes.push(`${q.id} (${seen.get(q.id)} + ${tense})`);
        seen.set(q.id, tense);
      }
    }
    expect(dupes).toEqual([]);
  });

  it('has globally unique sentences', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const bank of BANKS.values()) {
      for (const q of bank) {
        q.sentences.forEach((_, i) => {
          const key = sentenceText(q, i).toLowerCase().trim();
          const owner = seen.get(key);
          if (owner) dupes.push(`"${key}" in ${owner} and ${q.id}`);
          else seen.set(key, q.id);
        });
      }
    }
    expect(dupes).toEqual([]);
  });

  for (const [tense, bank] of BANKS) {
    describe(tense, () => {
      it('is a non-empty bank', () => {
        expect(bank.length).toBeGreaterThan(0);
      });

      it('has structurally valid questions', () => {
        const errors: string[] = [];
        for (const q of bank) {
          if (!q.id.startsWith(`${tense}-`)) errors.push(`${q.id}: id does not match bank ${tense}`);
          if (!MECHANISMS.has(q.mechanism)) errors.push(`${q.id}: unknown mechanism ${q.mechanism}`);
          if (![1, 2, 3].includes(q.difficulty)) errors.push(`${q.id}: difficulty ${q.difficulty}`);
          if (!q.prompt?.ru) errors.push(`${q.id}: missing prompt.ru`);
          if (q.sentences.length === 0) errors.push(`${q.id}: no sentences`);

          const diffTag = q.tags.find((t) => t.startsWith('difficulty-'));
          if (diffTag && diffTag !== `difficulty-${q.difficulty}`) {
            errors.push(`${q.id}: tag ${diffTag} contradicts difficulty ${q.difficulty}`);
          }
          const tenseTag = q.tags.find((t) => TENSE_IDS.has(t));
          if (tenseTag && tenseTag !== tense) {
            errors.push(`${q.id}: tense tag ${tenseTag} contradicts bank ${tense}`);
          }
        }
        expect(errors).toEqual([]);
      });

      it('has valid sentences, tokens and distractors', () => {
        const errors: string[] = [];
        for (const q of bank) {
          q.sentences.forEach((s, si) => {
            const where = `${q.id}[${si}]`;
            if (s.answer !== tense) errors.push(`${where}: answer ${s.answer} != bank ${tense}`);
            if (s.tokens.length === 0) errors.push(`${where}: no tokens`);
            if (!s.tokens.some((t) => t.role === 'verb')) errors.push(`${where}: no verb token`);

            for (const t of s.tokens) {
              if (!TOKEN_TYPES.has(t.type)) errors.push(`${where}: token type ${t.type}`);
              if (t.type === 'space' && !/^\s+$/.test(t.value)) errors.push(`${where}: bad space token "${t.value}"`);
              if (t.type !== 'space' && t.value.trim() === '') errors.push(`${where}: empty token`);
              lintText(t.value, `${where} token`, errors);
              if (t.translation?.ru) lintRussian(t.translation.ru, `${where} "${t.value}" translation`, errors);
            }

            // Distractors are optional (studyChoices falls back to the
            // pedagogical MAP), but when present there must be exactly 3.
            const ids = (s.distractors ?? []).map((d) => d.tenseId);
            if (ids.length !== 0 && ids.length !== 3) {
              errors.push(`${where}: ${ids.length} distractors, expected 0 or 3`);
            }
            if (ids.includes(s.answer)) errors.push(`${where}: distractor equals answer`);
            if (new Set(ids).size !== ids.length) errors.push(`${where}: duplicate distractors`);
            for (const d of ids) if (!TENSE_IDS.has(d)) errors.push(`${where}: unknown distractor ${d}`);

            for (const a of s.annotations ?? []) {
              if (a.from > a.to || a.from < 0 || a.to >= s.tokens.length) {
                errors.push(`${where}: annotation ${a.from}-${a.to} out of bounds (${s.tokens.length} tokens)`);
              }
              if (a.note.ru) lintRussian(a.note.ru, `${where} annotation note`, errors);
            }
          });
        }
        expect(errors).toEqual([]);
      });

      it('has clean Russian explanatory text', () => {
        const errors: string[] = [];
        for (const q of bank) {
          lintRussian(q.prompt.ru ?? '', `${q.id} prompt`, errors);
          if (q.explanation?.ru) lintRussian(q.explanation.ru, `${q.id} explanation`, errors);
          if (q.rules?.ru) lintRussian(q.rules.ru, `${q.id} rules`, errors);
          for (const ex of q.contextExamples ?? []) lintText(ex, `${q.id} example`, errors);
        }
        expect(errors).toEqual([]);
      });
    });
  }
});
