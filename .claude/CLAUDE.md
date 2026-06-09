# Tenserium — Project Context for Claude

## What is this

Speed-based interactive trainer for English tenses. Players see a sentence or Russian context description and press F1–F12 to identify the tense as fast as possible. Primary audience: Russian speakers. Primary platform: web desktop (hotkey-first), mobile planned.

Full product spec: [`docs/description.md`](../docs/description.md)

---

## Approved Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Angular 22 (upgrade from 19) | Already installed; SSR enabled |
| Change detection | Zoneless + Signals | Angular 22 stable |
| Hosting | Netlify | SSR support via Edge Functions; GitHub Pages has no SSR |
| Database | Supabase (PostgreSQL) | Auth + Realtime + REST in one; SQL > NoSQL for this schema |
| Backend logic | Supabase Edge Functions (Deno) | Score validation, matchmaking, daily challenge cron |
| Package manager | pnpm | Already in use |

---

## Architecture: FSD + CQRS

Feature-Sliced Design layers (top → bottom, imports go downward only):

```
src/
├── app/        — routing, providers, shell layouts
├── pages/      — thin route-level components
├── widgets/    — self-contained UI blocks (question-card, score-bar, squad-board)
├── features/   — user interactions (answer-input, auth, report-error, daily-share)
├── entities/   — business objects (tense, question, session, user, match, learn)
└── shared/     — ui kit, utils, api client, config, types
```

CQRS via Angular Signal Stores (no NgRx):
- **Commands** — methods that mutate state (`submitAnswer`, `nextQuestion`)
- **Queries** — `computed()` signals that derive read-only views (`currentStreak`, `score`, `isComplete`)

Domain stores: `GameSessionStore`, `UserStore`, `LearnStore`, `MatchStore`, `DailyStore`

---

## Key Domain Facts

- **12 tenses**: 3 time periods × 4 aspects (Simple / Continuous / Perfect / Perfect Continuous)
- **Hotkeys**: F1–F12 mapped to tenses in order; configurable by user
- **Scoring**: base (100 × difficulty) + speed bonus (linear decay) + streak multiplier (cap ×5)
- **Modes**: Normal (open, all tenses) and Rank (gated, matchmaking, squad battles up to 4 players)
- **Squad battle**: all players see the same question simultaneously, answer independently; first correct = most points; wrong = 500ms lock
- **Leagues (CEFR)**: Elementary (A1–A2 / IELTS 3–4 / TOEFL 32–45) → Intermediate (B1–B2 / IELTS 5–7 / TOEFL 46–94) → Advanced (C1–C2 / IELTS 7.5–9 / TOEFL 95–120)
- **Divisions**: CEFR level + Roman numeral sub-division (A1-IV … C2-I) = 24 steps total; soft season reset to bottom sub-div of current CEFR level
- **Display preference**: user picks which score system shows next to division badge (IELTS / TOEFL / Cambridge / none); canonical mapping in `shared/config/cefr.config.ts`; helpers in `shared/lib/cefr.ts`
- **Ticket format by league**: Elementary = 1 sentence / 1 key; Intermediate = 2–3 sentences; Advanced = 4–5-sentence narrative, player submits a key-combo chain (e.g. F1·F3·F5·F1), answered sentences shown as coloured dots separated by ·
- **Combo rule**: combo freezes at the error, all earned combo points kept, −ticketBase deducted for wrong answer, multiplier resets to 1; next correct starts a new combo
- **Bots**: scripted bots fill empty squad slots (accuracy/delay scaled per league)
- **Anonymous play**: progress in localStorage; Rank mode and leaderboards require account
- **Content language**: Russian for prompts and UI (first release); English toggle planned

---

## Supabase Schema (primary tables)

```
users           — profile, league, rank_tier, rank_points, is_premium, daily_rank_matches
questions       — id, tense_id, type (sentence|context), prompt, difficulty (1|2|3), league
sessions        — id, user_id, mode, score, duration_ms, created_at
session_answers — session_id, question_id, is_correct, response_ms
daily_challenge — date (PK), question_ids[]
error_reports   — id, question_id, user_id, description, created_at
matches         — id, player_ids[], league, state, scores, created_at
match_answers   — match_id, player_id, ticket_idx, sentence_idx, tense_id, is_correct, response_ms, points
feedback        — id, category, description, email, created_at
```

---

## Storage Strategy

**Browser API first — Supabase in Phase 8.**

All state uses `shared/api/storage.service.ts` — never call `localStorage` directly.
When Phase 8 arrives, swap the implementation; the rest of the code is unchanged.

| Phases | Storage |
|--------|---------|
| 1–7 (CI/CD, Angular, FSD, Game Engine, Onboarding, Learn, Daily) | Browser API (localStorage) |
| 8 (Accounts) | Supabase Auth + DB introduced |
| 9–15 (Rank, Leaderboards, Monetization…) | Supabase fully |

---

## Phase Priority (do not skip ahead)

| # | Phase | Done when | Status |
|---|-------|-----------|--------|
| 1 | CI/CD: GitHub Actions → GitHub Pages | PR checks pass, deploy works | ✅ |
| 2 | Angular 19 → 22 | Zoneless, no zone.js | ✅ |
| 3 | FSD refactor | Folder structure matches spec above | ✅ |
| 4 | Game Engine + Normal Mode | Playable end-to-end, mobile-responsive | ✅ |
| 5 | Onboarding | First-launch demo + 5-question sample | ✅ |
| 6 | Learn pages (priority tenses: Simple family + Present/Past Continuous + Present Perfect) | 6 tenses have grammar content | ✅ |
| 7 | Daily Challenge (date-seeded, client-side) | Fixed daily set + share card, no backend | ⬜ |
| 8 | Netlify + Supabase + Auth + Cloud Sync | App deploys on Netlify, DB connected, localStorage migrated | ⬜ |
| 9 | Rank Mode + Squad Battle | Tiers, matchmaking, bots, real-time | ⬜ |
| 10 | Leaderboards + Stats | Global/weekly/friends tabs | ⬜ |
| 11 | Monetization | Stripe, premium flag, ad banners | ⬜ |
| 12 | Text Analysis Mode | NLP highlight + inline explanations | ⬜ |
| 13 | PWA | Service worker, offline learn pages | ⬜ |
| 14 | Visual polish | Color system, micro-animations, timer bar | ⬜ |
| 15 | Sound design | Web Audio API, 7 events, sound packs | ⬜ |
| — | Content track (parallel) | All 12 tenses: 20+10 questions, all learn pages | 🔄 |

---

## Developer TODO

Live task list with прогрессом: [`docs/plan.md`](../docs/plan.md)
Check it before starting any work to understand current status and what's next.

---

## Current State

- **Angular 22** + Zoneless + Signals (no zone.js); esbuild/Vite via `@angular/build`
- **TypeScript 6.0.3**, target `ESNext`; Vitest runner via `@angular/build:unit-test`
- **177 tests passing** (Vitest); `vitest/globals` scoped to `tsconfig.spec.json`
- No backend, no auth, no database — all storage via `StorageService` (localStorage)
- Deployed to GitHub Pages via `actions/deploy-pages`; SSR disabled until Phase 8 (Netlify)

### Phases complete

| # | Phase | Notes |
|---|-------|-------|
| 1 | CI/CD | `ci.yml` (lint+build on PR) + `deploy.yml` (push → Pages) |
| 2 | Angular 19 → 22 | Zoneless, no zone.js, esbuild |
| 3 | FSD refactor | Path aliases, ESLint layer rules |
| 4 | Design system + Game Engine | Full game loop, 87 questions, scoring, hotkeys |
| 5 | Tests | 90 unit tests for game engine + normal mode |
| 6 | Onboarding | Demo + 5-question sample + save-prompt; 66 tests |
| 7 | Learn pages | `LearnDetailComponent`, 5 priority tenses with content, report-error modal, "Study this tense" button on wrong answer |

### Next: Phase 8 — Daily Challenge (Browser API, date-seeded)

Learn content status: **all 12 tenses complete** (formula, structure, usage, examples, markers, FAQ)

---

## Git Workflow

**Before starting any task**, create a branch from `main` using the appropriate prefix:

| Prefix | When to use |
|--------|-------------|
| `feat/` | New feature or user-visible capability |
| `fix/` | Bug fix |
| `refactor/` | Code restructure with no behaviour change |
| `chore/` | Tooling, deps, config, CI, docs |
| `test/` | Adding or fixing tests only |
| `perf/` | Performance improvement |

Branch name format: `<prefix>/<short-kebab-description>`
Examples: `feat/phase-7-daily-challenge`, `fix/hotkey-f12-missing`, `chore/update-angular-22`

Never commit directly to `main`.

---

## Conventions

- No comments unless the WHY is non-obvious
- No NgRx — use Angular Signal Stores only
- Imports strictly follow FSD layer order (lint-enforced)
- Dark theme first
- Russian UI strings in i18n-ready format from day one (even if not wired to i18n yet)
