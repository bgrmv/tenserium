# Tenserium Documentation

Complete documentation split by purpose. Choose based on what you need:

---

## 📋 **Architecture & Setup**

Прочитай в первую очередь:

- **[.claude/CLAUDE.md](../.claude/CLAUDE.md)** — архитектура проекта, FSD, tech stack, текущее состояние
- [devcontainer.md](devcontainer.md) — разработка в контейнере (Node, pnpm, IDE)

---

## 📖 **Product & Design**

Что такое Tenserium и как это должно работать?

- [description.md](description.md) — видение продукта, целевая аудитория, все фичи (Normal Mode, Rank Mode, Learn, Daily, Monetization)

---

## 🎮 **Specification (Domain Layer)**

Живой reference для всех бизнес-правил и конфигурации. **Обновляй здесь при изменении правил.**

- **[spec/README.md](spec/README.md)** ← навигация по спеке
  - [spec/domain-tense.md](spec/domain-tense.md) — 12 тензов (ID, hotkey, color, CEFR-unlock)
  - [spec/domain-scoring.md](spec/domain-scoring.md) — алгоритм очков (Normal + Rank, streak, combo)
  - [spec/domain-league.md](spec/domain-league.md) — лиги (CEFR A1–C2, 24 дивизиона, прогрессия, matchmaking)
  - [spec/game-modes.md](spec/game-modes.md) — Normal Mode, Rank, Daily Challenge (flows, ticket formats)
  - [spec/storage-schema.md](spec/storage-schema.md) — Supabase DB schema (Phase 9+)

---

## ✅ **Development Plan**

Фазы разработки и текущий статус:

- [plan.md](plan.md) — Developer TODO: что сделано, что делать дальше по фазам

---

## 🔍 **How to Navigate**

| Вопрос | Ответ в |
|--------|---------|
| "Где находится спека по X?" | `spec/README.md` + быстрый поиск по названию |
| "Как считаются очки?" | `spec/domain-scoring.md` |
| "Какие тензы в какой CEFR?" | `spec/domain-tense.md` + `spec/domain-league.md` |
| "Как работает Rank Mode?" | `spec/game-modes.md` → Rank Mode |
| "Какая таблица хранит матчи?" | `spec/storage-schema.md` → Tables |
| "Что делать дальше в разработке?" | `plan.md` → текущая фаза |
| "Как настроить devcontainer?" | `devcontainer.md` |
| "Что вообще делает приложение?" | `description.md` |
| "Как организован код?" | `.claude/CLAUDE.md` |

---

## 📌 **Spec Sync Rules**

Когда обновлять спеку:

✅ **При изменении бизнес-правил** (scoring formula, tier rules, etc.)  
✅ **При добавлении новой фичи** (new game mode, new mechanics)  
✅ **Одновременно с кодом** — если меняешь правило, обновляй spec в том же коммите  

❌ **Не нужно** обновлять спеку на каждый рефактор кода, если правила не меняются

---

## 📂 **File Structure**

```
docs/
├── README.md                      ← ты здесь
├── description.md                 — product vision
├── plan.md                         — developer roadmap (фазы)
├── devcontainer.md               — IDE setup
└── spec/
    ├── README.md                  — спека навигация
    ├── domain-tense.md            — 12 тензов
    ├── domain-scoring.md          — scoring rules
    ├── domain-league.md           — rank system
    ├── game-modes.md              — Normal/Rank/Daily
    └── storage-schema.md          — DB schema
```

---

## 🔗 **Architecture Overview**

```
FSD (Feature-Sliced Design)           Stores (Angular Signals CQRS)
├── app/          routing               ├── GameSessionStore
├── pages/        routes                ├── UserStore
├── widgets/      UI blocks             ├── LearnStore
├── features/     interactions          ├── MatchStore
├── entities/     business objects      └── DailyStore
└── shared/       utils, types, api
```

Подробней: `.claude/CLAUDE.md` → Architecture section

---

## 🚀 **Quick Start**

```bash
# Setup
pnpm install
npm run dev           # localhost:4200

# See current task
cat docs/plan.md | grep "^## [0-9]" | head -5

# Find a rule
grep -r "combo\|streak" docs/spec/

# Update devcontainer
cat docs/devcontainer.md
```

---

## 💡 **Best Practices**

1. **Link to specs**: when implementing a feature, link to the relevant spec file
2. **Keep examples**: concrete examples in specs are better than prose
3. **One source of truth**: if a rule is in code, it must be in spec; if rule changes, update both
4. **Index**: use `spec/README.md` as your search index, not the full file list

---

Последний update: 2026-06-08

