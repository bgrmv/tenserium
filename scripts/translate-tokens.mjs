/**
 * Translates word tokens in all question JSON files using MyMemory API.
 * Deduplicates words, translates once per unique value, then writes back.
 *
 * Usage: node scripts/translate-tokens.mjs
 * Optional: node scripts/translate-tokens.mjs --dry-run  (prints dict, no writes)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_MS = 120; // stay well under MyMemory's ~5 req/s free limit
const dir = 'src/assets/questions';

// ── 1. Collect unique word values ────────────────────────────────────────────

const files = readdirSync(dir).filter(f => f.endsWith('.json'));
const uniqueWords = new Set();

for (const file of files) {
  const questions = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  for (const q of questions) {
    for (const s of q.sentences) {
      for (const t of s.tokens) {
        if (t.type === 'word') uniqueWords.add(t.value);
      }
    }
  }
}

console.log(`Found ${uniqueWords.size} unique word tokens across ${files.length} files.`);

// ── 2. Translate each unique word ────────────────────────────────────────────

/** @type {Map<string, string>} word → Russian translation */
const dict = new Map();
let idx = 0;

for (const word of uniqueWords) {
  idx++;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|ru`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const ru = data?.responseData?.translatedText;
    if (ru && ru !== word) {
      dict.set(word, ru);
      process.stdout.write(`[${idx}/${uniqueWords.size}] ${word} → ${ru}\n`);
    } else {
      process.stdout.write(`[${idx}/${uniqueWords.size}] ${word} → (skipped)\n`);
    }
  } catch (err) {
    console.error(`  ERROR translating "${word}": ${err.message}`);
  }
  await new Promise(r => setTimeout(r, DELAY_MS));
}

if (DRY_RUN) {
  console.log('\nDry run — no files written.');
  process.exit(0);
}

// ── 3. Write translations back to token objects ──────────────────────────────

for (const file of files) {
  const path = join(dir, file);
  const questions = JSON.parse(readFileSync(path, 'utf8'));
  let count = 0;

  for (const q of questions) {
    for (const s of q.sentences) {
      for (const t of s.tokens) {
        if (t.type === 'word') {
          const ru = dict.get(t.value);
          if (ru) {
            t.translation = { ru };
            count++;
          }
        }
      }
    }
  }

  writeFileSync(path, JSON.stringify(questions, null, 2) + '\n');
  console.log(`Written ${file} (${count} tokens translated)`);
}

console.log('\nDone. Review translations in the JSON files and correct any homonyms.');
