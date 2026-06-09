# Tenserium — Developer TODO

> Приоритет: функционал → стили → звук.
> Полный контекст, стек и архитектура: `.claude/CLAUDE.md`

---

## Принципы плана

- **Browser API first** — всё, что можно сделать без backend, делается без него.
- **Supabase появляется в Phase 9** (Auth + cloud sync), не раньше.
- **Netlify нужен только для SSR** — до Phase 9 живём на GitHub Pages.
- **Mobile-responsiveness с Phase 4** — не болтаем потом на готовый layout.
- **Контент (вопросы, learn-страницы) — отдельный трек**, не блокирует инфру.
- **Абстракция хранилища** — в Phase 4 вводим `StorageService`, чтобы замена на Supabase была хирургической.

---

## 0. Уже сделано

- [x] Angular 19 + SSR (Express) инициализирован
- [x] pnpm подключён
- [x] GitHub Actions → деплой на GitHub Pages
- [x] DrawIO-схемы времён
- [x] Home grid — 12 слотов времён
- [x] Present Simple: learn-страница (правила, примеры, FAQ)
- [x] Present Simple: card-компонент с SVG-схемой
- [x] Exam-страница — скаффолд (без логики)
- [x] Спецификация: доменная архитектура (domain-*.md, game-modes.md, storage-schema.md)

---

## 1. CI/CD (GitHub Pages остаётся)

> Netlify и Supabase — в Phase 8. Сейчас только чистый пайплайн.
> SSR отключён — GitHub Pages статический. SSR вернём в Phase 8 при переходе на Netlify.

- [x] Удалить или переписать `.github/workflows/node.js.yml`
- [x] Создать `.github/workflows/ci.yml`
  - [x] Запускать на каждый PR: lint + build
  - [x] Кэшировать `pnpm store` для скорости
- [x] Создать `.github/workflows/deploy.yml`
  - [x] Push в `main` → deploy на GitHub Pages
  - [x] `404.html` = копия `index.html` (SPA-роутинг на GitHub Pages)
- [x] Убрать `server`/`prerender`/`ssr` из `angular.json` до Phase 8
- [x] *(Опционально, не блокирует)* `.devcontainer/devcontainer.json` (Node 22, pnpm, Angular CLI)

---

## 2. Angular 19 → 22 ✅

> Делать сейчас — пока кода мало. Каждая версия — отдельный коммит.

- [x] **19 → 20**
  - [x] `ng update @angular/core@20 @angular/cli@20`
  - [x] Добавить `provideZonelessChangeDetection()` в `app.config.ts`
  - [x] Убрать `zone.js` из `polyfills`
- [x] **20 → 21**
  - [x] `ng update @angular/core@21 @angular/cli@21`
- [x] **21 → 22**
  - [x] `ng update @angular/core@22 @angular/cli@22`
  - [x] Обновить `tsconfig.json`: target ESNext (TS 6 не поддерживает `es2025` как named target)
  - [x] Удалить `zone.js` из `package.json` и `angular.json`
  - [x] Переключить на `@angular/build` (esbuild/Vite), убрать `@angular-devkit/build-angular`
- [x] После миграции
  - [x] Заменить Karma на Vitest; `vitest/globals` в `tsconfig.spec.json`, спеки исключены из `tsconfig.json`
  - [x] `ng build --configuration production` — нет ошибок
  - [x] Обновить devcontainer: Node 24, порт 4200, pnpm store volume

---

## 3. FSD-рефакторинг ✅

- [x] Создать структуру папок согласно FSD
  ```
  src/
  ├── app/        — роутинг, провайдеры, shell
  ├── pages/      — pages/home/, pages/present-simple/
  ├── widgets/    — пусто (gitkeep)
  ├── features/   — пусто (gitkeep)
  ├── entities/   — entities/tense/ (tense-card)
  └── shared/     — config/tenses.config.ts, index.ts
  ```
- [x] Обновить `tsconfig.json` — path aliases для каждого слоя
  - [x] `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`
- [x] Настроить ESLint-правила на запрет импортов между слоями
  - [x] `@typescript-eslint/no-restricted-imports` per-layer (value запрещён вверх, `import type` разрешён)
- [x] Перенести существующий код в FSD-структуру
  - [x] `home-page.component` → `pages/home/ui/home.page.ts`
  - [x] `present-simple/pages/*` → `pages/present-simple/ui/` (shell + learn + exam)
  - [x] `present-simple/ui/card` → `entities/tense/ui/tense-card/`
  - [x] Barrel `index.ts` в каждом slice
- [x] Создать `shared/config/tenses.config.ts` — 12 времён (id, hotkey F1–F12, order) + `TenseId` тип
- [x] Создать `shared/types/` — `Question`, `Session`, `UserProfile` (Phase 4)

---

## 4. Перенос дизайн-системы (design/tenserium-angular → Tenserium/) ✅

> Reference-реализация создана в `design/tenserium-angular/`. Этот этап переносит
> её целиком в production-проект и разблокирует Phase 5.

### Глобальные стили и шрифты
- [x] `src/index.html` — Google Fonts: Space Grotesk, IBM Plex Sans, IBM Plex Mono
- [x] `src/styles.css` — CSS custom properties (oklch-цвета, типографика, border-radius, кнопки, скролл)
- [x] `src/shared/config/tense-colors.ts` — `tenseColor()`, `tenseCssVars()`, `colorVarRef()`
- [x] `src/shared/config/rank.config.ts` — `RANK_TIERS`, `rankProgress()`, `rankTier()`
- [x] Расширить `src/shared/config/tenses.config.ts` — добавить `getTense()`, `tensesByTime()`, `hotkeyToTense()`

### Ассеты
- [x] `src/assets/questions/{tense-id}.json` — 12 JSON банков вопросов (из design/assets/questions/)
- [x] `src/assets/learn/{tense-id}.json` — 12 JSON с грамматическим контентом (из design/assets/learn/)

### Shared API / Lib / UI
- [x] `shared/api/storage.service.ts` — localStorage-seam с префиксом 'tenserium:'
- [x] `shared/lib/scoring.ts` — `calcPoints()` + unit-тесты
- [x] `shared/lib/game-timer.ts` — rAF-based сигнальный countdown
- [x] `shared/lib/hotkeys.service.ts` — F1–F12 Observable (+ digit-fallback для mobile)
- [x] `shared/ui/icon/` — `IconComponent` + 20 SVG-путей
- [x] `shared/ui/avatar/` — `AvatarComponent` с initials и градиентом
- [x] `shared/ui/progress-bar/` — `ProgressBarComponent`
- [x] `shared/ui/rank-shield/` — `RankShieldComponent`
- [x] `shared/ui/logo/` — `LogoComponent` (lightning bolt)

### Entities
- [x] `entities/session/model/game-session.store.ts` — CQRS сигнал-стор сессии
- [x] `entities/user/model/user.store.ts` — профиль + ранговые очки через StorageService
- [x] `entities/question/api/question.repository.ts` — lazy-fetch через Angular `resource()`
- [x] `entities/learn/api/learn.repository.ts` — контент learn-страниц
- [x] `entities/match/model/match.store.ts` — скриптованные боты для Squad Battle

### Features
- [x] `features/answer-input/ui/answer-grid.component.ts` — 3×4 грид с hotkeys + lock-state
- [x] `features/session-config/ui/session-config.component.ts` — форма настройки сессии
- [x] `features/report-error/ui/report-error.component.ts` — модалка репорта ошибки

### Widgets
- [x] `widgets/app-shell/ui/app-shell.component.ts` — rail (64px) + topbar (60px) + router-outlet
- [x] `widgets/mode-card/ui/mode-card.component.ts` — карточка режима с tense-swatches
- [x] `widgets/question-card/ui/question-card.component.ts` — prompt + timer bar + reveal
- [x] `widgets/score-bar/ui/score-bar.component.ts` — combo × множитель + счёт + прогресс
- [x] `widgets/session-summary/ui/session-summary.component.ts` — итоговый экран (результаты + лидерборд)
- [x] `widgets/squad-board/ui/squad-board.component.ts` — Live HUD 4 игроков

### Pages
- [x] `pages/home/` — переписать под дизайн (mode cards, daily block, profile card)
- [x] `pages/game/ui/game.page.ts` + `pages/game/model/mode-config.ts` — полный игровой цикл
- [x] `pages/learn/ui/learn.page.ts` — общая (не только present-simple; sidebar + 12 тем)
- [x] `pages/stats/ui/stats.page.ts` — ранг, точность по аспектам, активность

### App root
- [x] `app/app.component.ts` — инжектировать `tenseCssVars('aspect')` в `:root` при старте
- [x] `app/app.routes.ts` — маршруты: `/home`, `/game` (query: mode), `/learn`, `/stats`
- [x] Удалить `pages/present-simple/` — заменено общей learn-страницей

---

## 5. Game Engine + Normal Mode (Browser API) ✅

> Цель: игра работает end-to-end, прогресс в localStorage.
> Mobile-responsive с самого начала — не болтать потом на готовый layout.

**DONE**: Complete game loop implemented. 87 questions across all 12 tenses.
90 unit tests passing. Ready for Phase 6 (Onboarding).

### Абстракция хранилища

- [x] `shared/api/storage.service.ts` — интерфейс с методами `save/load/clear`
  - [x] Реализация: `localStorage` (сейчас)
  - [ ] Реализация: Supabase (Phase 9, замена одного файла)
  - [x] Использовать только через этот сервис — нигде в коде прямых вызовов `localStorage`

### Контент: банк вопросов

> 87 вопросов по всем 12 временам, структурированы для валидации игрового цикла.

- [x] Структура `shared/config/questions/{tense-id}.json` — lazy fetch при старте сессии
- [x] Present Simple: 10 вопросов (mixed sentence + context) ✅
- [x] Past Simple: 10 вопросов ✅
- [x] Future Simple: 10 вопросов ✅
- [x] Present Continuous: 8 вопросов ✅
- [x] Past Continuous: 7 вопросов ✅
- [x] Present Perfect: 8 вопросов ✅
- [x] Future Continuous: 6 вопросов ✅
- [x] Future Perfect: 6 вопросов ✅
- [x] Past Perfect: 6 вопросов ✅
- [x] Present Perfect Continuous: 6 вопросов ✅
- [x] Past Perfect Continuous: 5 вопросов ✅
- [x] Future Perfect Continuous: 5 вопросов ✅

### GameSession Store

- [x] `entities/session/session.store.ts` ✅
  - [x] State: `{ questions[], currentIndex, answers[], status, startedAt }`
  - [x] State machine: `idle → loading → question → result-flash → question → ... → summary`
  - [x] Commands: `startSession(config)`, `submitAnswer(tenseId, responseMs)`, `nextQuestion()`
  - [x] Queries (computed): `currentQuestion`, `score`, `currentStreak`, `accuracy`, `isComplete`
  - [x] Сохранение завершённой сессии через `StorageService`
  - [x] Unit-тесты: 20 spec (full happy path coverage)

### Scoring

- [x] `shared/lib/scoring.ts` ✅
  - [x] `calcPoints({ isCorrect, responseMs, windowMs, streak, difficulty }): number`
  - [x] Base: `100 × difficulty`
  - [x] Speed bonus: linear decay 0–50 за `windowMs` (10 000 ms)
  - [x] Streak multiplier: `min(streak, 5)`
  - [x] Wrong: streak reset, 0 очков
  - [x] Unit-тесты (calcPoints corner cases)

### Хоткей-сервис

- [x] `shared/lib/hotkeys.service.ts` ✅
  - [x] `fromEvent(document, 'keydown')` → фильтр F1–F12 → emit `TenseId`
  - [x] Активен только на игровых страницах
  - [x] Digit fallback (1–9, 0) для мобайла

### Таймер

- [x] `shared/lib/game-timer.ts` ✅
  - [x] Signal-based countdown (10 000 ms)
  - [x] rAF-driven, zoneless-friendly
  - [x] onExpire callback → auto-skip вопроса

### Игровой экран

- [x] Маршрут `/game` ✅
- [x] Настройки перед стартом: выбор времён, длина сессии (10 / 20 / 40) ✅
- [x] `widgets/question-card/` — prompt, тип вопроса, timer bar, F1–F12 легенда ✅
- [x] `widgets/score-bar/` — текущий счёт, стрик × множитель, прогресс (N/total) ✅
- [x] Result flash: 700ms зелёный / 1050ms красный overlay ✅
- [x] `features/answer-input/answer-grid.component.ts` — hotkey grid + mobile support ✅
- [x] **Responsive**: работает на 375px–1440px ✅
- [x] Unit & E2E тесты: 70+ spec ✅

### Экран итогов

- [x] `widgets/session-summary/` ✅
  - [x] Итоговый счёт, accuracy %, avg speed (avgResponseMs)
  - [x] Place badge (1st, 2nd, 3rd, 4th)
  - [x] Кнопки: «Играть снова», «Exit to home»
  - [x] Squad support (leaderboard board input)

---

## 6. Онбординг ✅

> РАНЬШЕ, чем Learn-страницы — без онбординга непонятно что не так с UX.

- [x] Флаг `hasSeenOnboarding` через `StorageService`
- [x] При первом открытии: demo-карточка вопроса
  - [x] Анимированный highlight F-клавиш (или on-screen кнопок на mobile) — `is-hint` pulse на AnswerGridComponent
  - [x] Пример правильного ответа (зелёный flash)
- [x] После demo → 5 вопросов Normal Mode без настройки (Present + Past Simple)
- [x] После 5 вопросов: модалка «Сохрани прогресс»
  - [x] Кнопки: «Создать аккаунт» / «Продолжить без аккаунта»
  - [x] Не блокирует дальнейшую игру (аккаунт = Phase 8, пока = continueWithout)
- [x] Inferred level: по точности 5 вопросов → «Начинающий / Средний / Продвинутый» (отображается в save-prompt)

**Unit tests** (`onboarding.page.spec.ts` — 52 tests, `answer-grid.component.spec.ts` — 8 tests):
- Initial state, demo step (correct/wrong/guard/flash timing), game step (answer/timeout/progression/score/streak), inferredLevel (6 cases), save-prompt (markOnboardingSeen + navigate), computed signals

**E2E tests** (`e2e/onboarding-flow.spec.ts` — 14 scenarios):
- Demo renders, F1 keyboard, correct/wrong flash, explained section, CTA, progress 1/5, full 5-question run, save-prompt card + level, continue-without navigates to /home, home redirects first-time visitors

---

## 7. Learn-страницы (приоритетные) ✅

> Не все 12 сразу. Сначала "Simple" family + самые частые.

- [x] Единый шаблонный компонент `entities/learn/ui/learn-detail/` с `input.required<TenseId>()`
  - [x] Секции: правило (formula chips), структура (Aff/Neg/Q), time markers, примеры, FAQ
  - [x] Навигация: ← предыдущее / следующее → (routerLink)
  - [x] Outputs: `trainClick`, `reportClick`
  - [x] 22 UI-теста (`learn-detail.component.spec.ts`)
- [x] Контент (приоритет 1)
  - [x] Present Simple
  - [x] Past Simple
  - [x] Future Simple
- [x] Контент (приоритет 2)
  - [x] Present Continuous
  - [x] Past Continuous
  - [x] Present Perfect
- [x] Контент (приоритет 3 — отдельный трек, не блокирует)
  - [x] Future Continuous
  - [x] Future Perfect
  - [x] Past Perfect
  - [x] Present Perfect Continuous
  - [x] Past Perfect Continuous
  - [x] Future Perfect Continuous
- [x] На экране wrong-answer: кнопка «Study {tense name}» → `/learn/{tense-id}`
- [x] После Learn: кнопка «Train» → `/game`
- [x] `features/report-error/` — кнопка на каждом вопросе и learn-странице
  - [x] Модалка с textarea (signal-based, без `@angular/forms`)
  - [x] Сохранять в `StorageService` (localStorage-очередь) — POST в Supabase в Phase 9
  - [x] Toast-подтверждение

---

## 8. Daily Challenge (Browser API, date-seeded) ✅

> Не нужен cron-сервер. Детерминированный сид по дате даёт всем одинаковый набор.

- [x] Алгоритм: `seed = YYYY-MM-DD` → seeded random (LCG) → выбрать 15 вопросов из банка
- [x] Одна попытка в день — трекинг через `StorageService` (дата последнего прохождения)
- [x] Маршрут `/daily` — те же компоненты что Normal mode
- [x] **Стрик**
  - [x] Трекинг последовательных дней с завершённым Daily (localStorage, `DailyStore`)
  - [x] Flame-индикатор в nav-bar (badge с числом дней)
- [x] **Шаринг** (`features/daily-share/`)
  - [x] HTML Canvas → PNG result card (дата, emoji-паттерн, счёт, ссылка)
  - [x] Web Share API + clipboard fallback

---

## 9. Backend: Netlify + Supabase + Auth

> Суpabase появляется здесь, не раньше. GitHub Pages → Netlify.

### Netlify

- [ ] Зарегистрироваться / подключить GitHub repo
- [ ] Установить `@netlify/angular-runtime`
- [ ] Создать `netlify.toml` в корне
- [ ] Обновить `.github/workflows/deploy.yml` → `netlify deploy --prod`
- [ ] Добавить секреты: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
- [ ] PR автоматически получает preview URL

### Supabase

- [ ] Инициализировать Supabase CLI: `supabase init`
- [ ] Создать первую миграцию `supabase/migrations/001_init_schema.sql`
  - [ ] `users` (id, nickname, is_premium, league, rank_tier, rank_points, daily_rank_matches, created_at)
    - `league`: elementary | intermediate | advanced
    - `rank_tier`: iron | bronze | silver | gold | platinum (внутри лиги)
  - [ ] `questions` (id, tense_id, type, prompt, difficulty, created_at)
  - [ ] `sessions` (id, user_id, mode, score, duration_ms, created_at)
  - [ ] `session_answers` (session_id, question_id, is_correct, response_ms)
  - [ ] `daily_challenge` (date PK, question_ids[])
  - [ ] `error_reports` (id, question_id, user_id, description, created_at)
  - [ ] `matches` (id, player_ids[], league, state, scores, created_at)
  - [ ] `match_answers` (match_id, player_id, ticket_idx, sentence_idx, tense_id, is_correct, response_ms, points)
  - [ ] `feedback` (id, category, description, email, created_at)
  - [ ] Materialized view `leaderboard`
- [ ] Row Level Security на всех таблицах
- [ ] `supabase gen types` → TypeScript-типы
- [ ] Обновить `StorageService` — новая реализация через Supabase клиент
- [ ] Добавить env variables в Netlify UI (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)

### Auth

- [ ] `features/auth/` — Supabase Auth: email/password + Google OAuth
- [ ] Login / Register — страница или модалка
- [ ] Redirect после login → туда откуда пришёл

### Cloud Sync

- [ ] `UserStore` — загрузка профиля из Supabase при login
- [ ] При первом login: one-time merge localStorage → Supabase
  - [ ] Сессии, стрик, error_reports-очередь
  - [ ] Очистить localStorage после успешного merge
- [ ] POST сессий в `sessions` + `session_answers` при завершении
- [ ] Профиль (`pages/profile/`) — ник, ранг, total points, статистика

---

## 10. Rank Mode

### Лиги (CEFR-привязка)

> Три лиги определяют пул времён, сложность вопросов и формат тикета.
> Переход вверх — по набранным ранговым очкам; вниз — при серийных поражениях.

| Лига | CEFR | IELTS | TOEFL iBT | Пул времён | Формат тикета |
|------|------|-------|-----------|------------|---------------|
| **Elementary** | A1–A2 | 3.0–4.0 | 32–45 | Present Simple, Past Simple | 1 предложение, короткое |
| **Intermediate** | B1–B2 | 5.0–7.0 | 46–94 | + Future Simple, Present/Past Continuous, Present Perfect | 2–3 предложения |
| **Advanced** | C1–C2 | 7.5–9.0 | 95–120 | Все 12 времён | 4–5 предложений, нарратив |

**Начальный уровень** определяется по первым 10 вопросам онбординга → автоматическое
размещение. Игрок может вручную понизить стартовую лигу перед первым матчем.

---

### Тикет-формат по лигам

#### Elementary
- 1 предложение: `Did I play?` / `Do I play?`
- 1 ответ → 1 клавиша (F1–F12)
- Ранговые очки за тикет: **2 pts base**

#### Intermediate
- 2–3 предложения с 2 временами
- Игрок отвечает последовательно на каждое предложение
- Ранговые очки за тикет: **4–6 pts base** (зависит от difficulty)

#### Advanced
- 4–5 предложений в единой нарративной цепочке
- Несколько времён; игрок нажимает клавиши по порядку → цепочка `F1 · F3 · F5 · F1`
- Пройденные предложения разделены `·` и подсвечиваются зелёным/красным
- Ранговые очки за тикет: **8–15 pts base**

---

### Система очков

```
ticketBase  = leagueBase × difficulty      // 2 / 4–6 / 8–15
speedBonus  = linear decay 0–50% за windowMs (8 000 ms)
posBonus    = первый правильный ответ → +50%, последний → 0%
comboMul    = min(comboLength, 5)          // множитель серии правильных ответов
```

**Правила начисления за тикет:**
- Каждый верный ответ в цепочке: `+( ticketBase × speedBonus × posBonus × comboMul )`
- Неверный ответ: `−ticketBase` за данный вопрос (без speed/combo бонуса)
- Ошибка **не обнуляет** набранные ранее очки за тикет — комбо замораживается до ошибки,
  после которой новое комбо начинается с нуля. Снятие всей комбо-цепочки за одну ошибку
  было бы непропорционально жестоким на Advanced-уровне (5 предложений).
- Wrong answer → 500 ms lock (нельзя ответить на следующее предложение)
- Timeout (нет ответа за windowMs) → 0 очков, без штрафа, без lock

**Итог по комбо (принятое решение):**
> Комбо считается до ошибки. Ошибка фиксирует заработанные очки, снимает `−ticketBase`
> и сбрасывает множитель в 1. Новая серия стартует со следующего верного ответа.
> Удалять всё комбо не стоит — это наказывает игрока дважды и отбивает желание
> пробовать длинные нарративные тикеты.

---

### Структура лиг и дивизионов

```
League        CEFR   Дивизионы (низ → верх)
──────────────────────────────────────────────────────
Elementary    A1     A1-IV  A1-III  A1-II  A1-I
              A2     A2-IV  A2-III  A2-II  A2-I
Intermediate  B1     B1-IV  B1-III  B1-II  B1-I
              B2     B2-IV  B2-III  B2-II  B2-I
Advanced      C1     C1-IV  C1-III  C1-II  C1-I
              C2     C2-IV  C2-III  C2-II  C2-I
```

6 CEFR-уровней × 4 суб-дивизиона = **24 ступени**.
Реализовано в `shared/config/cefr.config.ts`, хелперы в `shared/lib/cefr.ts`.

- [ ] **Прогрессия** внутри дивизиона: 0–100 ранговых очков → advance на 1 ступень
- [ ] **Понижение (demotion)**: 3 потери подряд в дивизионе `-IV` → drop на 1 ступень (минимум A1-IV)
- [ ] **Переход в следующую лигу**: достичь A2-I → B1-IV, B2-I → C1-IV
- [ ] **Сезонный soft-reset** раз в 3 месяца → до нижнего суб-дивизиона текущего CEFR-уровня
- [ ] **Разблокировка времён** по CEFR (не по очкам):
  - A1: Present Simple, Past Simple
  - A2: + Future Simple, Present Continuous
  - B1: + Past Continuous, Present Perfect
  - B2: + Past Perfect, Future Continuous, Present Perfect Continuous
  - C1: + Past Perfect Continuous, Future Perfect
  - C2: Future Perfect Continuous (все 12)
- [ ] **Эквиваленты и настройка отображения**
  - [ ] `shared/config/cefr.config.ts` ✅ — типизированный маппинг CEFR ↔ IELTS ↔ TOEFL ↔ Cambridge
  - [ ] `shared/lib/cefr.ts` ✅ — `getEquivalent()`, `getSubDivLabel()`, `getNextPosition()`
  - [ ] `shared/ui/division-badge/` — компонент: `B2-III · ~IELTS 6.0` (настраиваемый)
  - [ ] `entities/user/user.store.ts` — сигнал `scoreDisplayPreference: 'ielts'|'toefl'|'cambridge'|'none'`
  - [ ] `pages/equivalents/` — маршрут `/equivalents`: полная таблица с подсветкой текущей строки
  - [ ] `app/app.routes.ts` — добавить маршрут `/equivalents`
- [ ] **Разблокировка времён**
  - [ ] Elementary: только Present Simple + Past Simple
  - [ ] Intermediate: +4 времени (Future Simple, Present/Past Continuous, Present Perfect)
  - [ ] Advanced: все 12 времён
  - [ ] UI: locked-overlay на ячейках нераскрытых времён

---

### Matchmaking

- [ ] При поиске: запись в `match_queue` с `{ league, tier, user_id }`
- [ ] Edge Function (polling 2 сек): группировать ±1 тир в пределах лиги → создать матч
- [ ] Таймаут 15 сек → заполнить ботами
- [ ] **Scripted Bots**
  - [ ] `is_bot: true` в `match_players`
  - [ ] Elementary: `randomDelay(1200, 3500)`, accuracy 70%
  - [ ] Intermediate: `randomDelay(900, 3000)`, accuracy 78%
  - [ ] Advanced: `randomDelay(800, 2500)`, accuracy 85%

---

### Squad Battle (Supabase Realtime)

- [ ] Канал `match:{match_id}`
- [ ] Broadcast `{ playerId, sentenceIdx, tenseId, responseMs }`
- [ ] Edge Function валидирует и рассчитывает очки (с учётом posBonus — кто первый ответил)
- [ ] Цепочка ответов на тикет видна всем: `F1 · F3 · ?` (незавершённые — серые)
- [ ] 15 тикетов → result screen с итоговыми позициями
- [ ] **`widgets/squad-board/`**
  - [ ] 4 аватар-слота, ник, текущий счёт, текущий тир
  - [ ] Анимация при правильном ответе / красная вспышка при ошибке
  - [ ] Цепочка ответов текущего тикета под каждым игроком

---

## 11. Лидерборды + Статистика

- [ ] **Лидерборды** (`pages/leaderboard/`)
  - [ ] Маршрут `/leaderboard`
  - [ ] Вкладки: Global (top 100) / Weekly (сброс пн) / Friends (требует аккаунт)
  - [ ] Materialized view в Supabase, refresh раз в час
- [ ] **Базовая статистика (Free)**
  - [ ] Total score, ранг, top-3 времени по accuracy, стрик
- [ ] **Детальная статистика (Premium)**
  - [ ] Accuracy по таймлайну (график)
  - [ ] Speed heatmap по временам
  - [ ] Таблица: каждое время → accuracy / avg ms / total attempts
  - [ ] MVP count

---

## 12. Монетизация

- [ ] Premium-флаг `users.is_premium` в UserStore
- [ ] `features/premium-gate/` — guard для premium-функций
- [ ] Страница `/premium`
- [ ] **Stripe**
  - [ ] Stripe Checkout (subscription или one-time)
  - [ ] Supabase Edge Function: Stripe webhook → `UPDATE users SET is_premium = true`
- [ ] **Реклама (Free)**
  - [ ] Баннер на summary screen (каждые 3 сессии)
  - [ ] Google AdSense или Carbon Ads
  - [ ] Premium → скрыть
- [ ] **Лимиты Rank (Free)**
  - [ ] `users.daily_rank_matches` — счётчик матчей за день
  - [ ] Cron Edge Function: сброс каждый день 00:00 UTC
  - [ ] Лимит: 5 матчей/день → безлимит Premium

---

## 13. Text Analysis Mode

> Полностью клиентский — мог бы быть раньше, но сфокусируемся на core сначала.

- [ ] Маршрут `/text-analysis`
- [ ] Textarea для вставки текста + кнопка «Analyze»
- [ ] NLP-парсер на клиенте (`compromise.js` или regex по шаблонам)
  - [ ] Каждый конструкт → `<span class="tense-{id}">`
- [ ] Цветовая подсветка (та же палитра)
- [ ] Клик/тап → tooltip с объяснением (pre-written per tense pattern)
- [ ] *(Позднее)* AI-powered объяснения через Claude API

---

## 14. PWA + Service Worker

- [ ] `@angular/service-worker`
- [ ] `manifest.webmanifest` (icon, name, theme color)
- [ ] Кэширование оффлайн: learn-страницы + вопросы
- [ ] Responsive: Home grid 2×6 на мобайл, крупный текст

---

## 15. Визуальная полировка

- [ ] **Цветовая система**
  - [ ] 12 accent colors, CSS Custom Properties: `--tense-{id}: #...`
  - [ ] Применить везде: grid, learn, кнопки, text analysis
- [ ] **Темизация**: dark (default) + light toggle
- [ ] **Micro-анимации**
  - [ ] Появление вопроса: `translateY(-8px)→0` (200ms)
  - [ ] Correct flash: зелёный highlight → fade (300ms)
  - [ ] Wrong flash: красный shake (200ms)
  - [ ] Streak badge: scale up (150ms spring)
- [ ] **Timer Bar**: CSS `@keyframes` + hue transition green→red

---

## 16. Звуковой дизайн

- [ ] `shared/lib/sound.service.ts` (Web Audio API, `AudioContext`)
- [ ] Аудиофайлы (.ogg / .webm): question-appear, correct, wrong, streak-2, streak-3+, session-complete, daily-complete
- [ ] Volume: off по умолчанию
- [ ] Toggle 🔇/🔊 в topbar
- [ ] *(Premium)* Sound packs — Supabase Storage

---

## Контентный трек (параллельно основному)

> Не блокирует инфру, делается итеративно.

- [ ] Довести до 20+10 вопросов: Present Simple, Past Simple, Future Simple
- [ ] По 15 вопросов на каждое из оставшихся 9 времён
- [x] Learn-страницы приоритет 3 (Future Continuous, Perfect, Perfect Continuous — все 6 времён)
- [ ] Daily Challenge cron (Supabase Edge Function — серверный генератор для честности, заменяет date-seed после Phase 8)
