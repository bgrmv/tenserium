# Specification Index

Доменная спецификация Tenserium. Каждый файл покрывает один аспект системы.

**Быстрый поиск:** используй `Ctrl+P → spec/` + название.

---

## Domain Layer (бизнес-логика)

- [domain-tense.md](domain-tense.md) — 12 тензов, hotkeys, CEFR-unlock, colors, difficulty
- [domain-scoring.md](domain-scoring.md) — расчёт очков (Normal + Rank modes), streak rules, combo
- [domain-league.md](domain-league.md) — лиги (CEFR A1–C2), дивизионы (24 ступени), прогрессия, matchmaking

---

## Feature Layer (user-facing)

- [game-modes.md](game-modes.md) — Normal Mode, Rank Mode, Daily Challenge (flows, ticket formats, UI)
- [storage-schema.md](storage-schema.md) — Supabase schema (Phase 9+), tables, migrations, Edge Functions

---

## Architecture Overview

Для архитектурного view, см. `.claude/CLAUDE.md`:
- FSD структура (layers: app → pages → widgets → features → entities → shared)
- Tech stack (Angular 22, Supabase, Netlify)
- Phase priority
- Current state

---

## Quick Links

- **Configs**: `src/shared/config/` — tenses, colors, CEFR, questions
- **Stores**: `src/entities/*/model/*.store.ts` — game state (signal-based CQRS)
- **Libraries**: `src/shared/lib/` — scoring, hotkeys, timers, CEFR helpers
- **Questions**: `src/assets/questions/` — JSON по каждому тензу
- **Learn content**: `src/assets/learn/` — grammar rules + examples

---

## When to Use This

✅ **Searching for a rule**: "Как считаются комбо?" → `domain-scoring.md` → Combo Rules  
✅ **Understanding a feature**: "Как работает Rank mode?" → `game-modes.md` → Rank Mode  
✅ **Schema question**: "Какая таблица хранит...?" → `storage-schema.md` → Tables  
✅ **Config lookup**: "Где находится mapping CEFR → IELTS?" → `domain-league.md` → Display & Equivalents  

❌ **Architecture / FSD structure** → `.claude/CLAUDE.md`  
❌ **Development roadmap** → `docs/plan.md`  
❌ **Product vision / audience** → `docs/description.md`  

---

## File Ownership

Each spec file is owned by the layer it documents:

| File | Owns | Owner Notes |
|------|------|-----------|
| `domain-*.md` | Business logic, data models | Update when rules change |
| `game-modes.md` | Features, user flows | Update when mode rules change |
| `storage-schema.md` | Database, APIs, migrations | Update when schema changes |

When you commit code that changes these rules, **update the corresponding spec file** in the same PR.

---

## Maintaining Specs

- **Sync with code**: if you change a rule (e.g., combo multiplier cap), update the spec same commit
- **Link to files**: reference `src/path/file.ts:42` for implementation details
- **Use examples**: concrete examples (score calc, tier progression) are easier to understand than prose
- **Keep it lean**: specs describe *what* and *why*, not implementation details (those live in code/comments)
