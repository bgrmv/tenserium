# Tenserium

Speed-based interactive trainer for English tenses. Players see a sentence or a Russian context description and press **F1–F12** to identify the tense as fast as possible.

→ Full product spec: [`docs/description.md`](docs/description.md)  
→ Developer task list: [`docs/plan.md`](docs/plan.md)

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Angular 19 (→ 22 in Phase 2), SSR enabled |
| Change detection | Zoneless + Signals (after Phase 2) |
| Package manager | pnpm |
| Hosting | GitHub Pages (→ Netlify in Phase 8) |
| Database | none yet (→ Supabase in Phase 8) |

Architecture: **Feature-Sliced Design** + **CQRS via Angular Signal Stores** (see [CLAUDE.md](.claude/CLAUDE.md)).

---

## Local development

```bash
pnpm install
pnpm start          # dev server at http://localhost:4200
pnpm build          # production build
pnpm lint           # ESLint
pnpm test           # Karma unit tests
```

SSR preview (after build):

```bash
node dist/tenserium/server/server.mjs   # port 4000
```

---

## Current state (Phase 1 complete)

- Angular 19.1.6 + SSR (Express)
- Home grid — all 12 tense slots
- Learn page — **Present Simple** (full content)
- Exam page — scaffold only, no game logic
- CI (`ci.yml`): lint + build on every PR
- Deploy (`deploy.yml`): push to `main` → GitHub Pages

---

## Phase roadmap (summary)

| # | Phase | Status |
|---|-------|--------|
| 1 | CI/CD → GitHub Pages | **Done** |
| 2 | Angular 19 → 22, zoneless | Next |
| 3 | FSD refactor | — |
| 4 | Game Engine + Normal Mode | — |
| 5 | Onboarding | — |
| 6 | Learn pages (6 tenses) | — |
| 7 | Daily Challenge (client-side) | — |
| 8 | Netlify + Supabase + Auth | — |
| 9–15 | Rank, Leaderboards, Monetization… | — |
