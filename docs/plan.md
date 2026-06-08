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
  - [x] Обновить `tsconfig.json`: target ES2025
  - [x] Удалить `zone.js` из `package.json` и `angular.json`
  - [x] Переключить на `@angular/build` (esbuild/Vite), убрать `@angular-devkit/build-angular`
- [x] После миграции
  - [x] Заменить Karma на Vitest
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
- [ ] Создать `shared/types/` — `Question`, `Session`, `UserProfile` (Phase 4)

---

## 4. Game Engine + Normal Mode (Browser API)

> Цель: игра работает end-to-end, прогресс в localStorage.
> Mobile-responsive с самого начала — не болтать потом на готовый layout.

### Абстракция хранилища

- [ ] `shared/api/storage.service.ts` — интерфейс с методами `save/load/clear`
  - [ ] Реализация: `localStorage` (сейчас)
  - [ ] Реализация: Supabase (Phase 9, замена одного файла)
  - [ ] Использовать только через этот сервис — нигде в коде прямых вызовов `localStorage`

### Контент: банк вопросов

> Сначала 10 вопросов на 3 времени — провалидировать игровой цикл. Потом расширять.

- [ ] Структура `shared/config/questions/{tense-id}.json` — lazy fetch при старте сессии
- [ ] Present Simple: 10 вопросов (5 sentence + 5 context RU) — **минимум для старта**
- [ ] Past Simple: 10 вопросов
- [ ] Future Simple: 10 вопросов
- [ ] *(Расширение — отдельный трек, не блокирует Phase 4)*

### GameSession Store

- [ ] `entities/session/session.store.ts`
  - [ ] State: `{ questions[], currentIndex, answers[], status, startedAt }`
  - [ ] State machine: `idle → loading → question → result-flash → question → ... → summary`
  - [ ] Commands: `startSession(config)`, `submitAnswer(tenseId, responseMs)`, `nextQuestion()`
  - [ ] Queries (computed): `currentQuestion`, `score`, `currentStreak`, `accuracy`, `isComplete`
  - [ ] Сохранение завершённой сессии через `StorageService`

### Scoring

- [ ] `shared/lib/scoring.ts`
  - [ ] `calcPoints({ isCorrect, responseMs, windowMs, streak, difficulty }): number`
  - [ ] Base: `100 × difficulty`
  - [ ] Speed bonus: linear decay 0–50 за `windowMs` (10 000 ms)
  - [ ] Streak multiplier: `min(streak, 5)`
  - [ ] Wrong: streak reset, 0 очков
  - [ ] Unit-тесты

### Хоткей-сервис

- [ ] `shared/lib/hotkeys.service.ts`
  - [ ] `fromEvent(document, 'keydown')` → фильтр F1–F12 → emit `TenseId`
  - [ ] Активен только на игровых страницах
  - [ ] Unit-тест (mock KeyboardEvent)

### Таймер

- [ ] `shared/lib/game-timer.ts`
  - [ ] Signal-based countdown (10 000 ms)
  - [ ] Emit при истечении → auto-skip вопроса

### Игровой экран

- [ ] Маршрут `/game`
- [ ] Настройки перед стартом: выбор времён, длина сессии (10 / 20 / 40)
- [ ] `widgets/question-card/` — prompt, тип вопроса, timer bar, F1–F12 легенда
- [ ] `widgets/score-bar/` — текущий счёт, стрик × множитель, прогресс (N/total)
- [ ] Result flash: 1 сек. зелёный/красный overlay → следующий вопрос
- [ ] **Mobile**: on-screen кнопки при `isMobile` (не hotkey-only)
- [ ] **Responsive**: работает на 375px и 1440px

### Экран итогов

- [ ] `widgets/session-summary/`
  - [ ] Итоговый счёт, accuracy %, avg speed
  - [ ] Bar chart: accuracy по каждому времени
  - [ ] Highlight weakest tense
  - [ ] Кнопки: «Играть снова», «Учить [слабейшее время]»

---

## 5. Онбординг

> РАНЬШЕ, чем Learn-страницы — без онбординга непонятно что не так с UX.

- [ ] Флаг `hasSeenOnboarding` через `StorageService`
- [ ] При первом открытии: demo-карточка вопроса
  - [ ] Анимированный highlight F-клавиш (или on-screen кнопок на mobile)
  - [ ] Пример правильного ответа (зелёный flash)
- [ ] После demo → 5 вопросов Normal Mode без настройки (Present + Past Simple)
- [ ] После 5 вопросов: модалка «Сохрани прогресс»
  - [ ] Кнопки: «Создать аккаунт» / «Продолжить без аккаунта»
  - [ ] Не блокирует дальнейшую игру
- [ ] Inferred level: по первым ответам выбирать соотношение easy/medium/hard

---

## 6. Learn-страницы (приоритетные)

> Не все 12 сразу. Сначала "Simple" family + самые частые.

- [ ] Единый шаблонный компонент `entities/learn/learn-page/` с `@Input() tenseId`
  - [ ] Секции: правило, структура (Aff/Neg/Q), time markers, примеры, контекст, FAQ
  - [ ] Навигация: ← предыдущее / следующее →
- [ ] Контент (приоритет 1 — блокирует Phase 8)
  - [x] Present Simple
  - [ ] Past Simple
  - [ ] Future Simple
- [ ] Контент (приоритет 2 — до Phase 9)
  - [ ] Present Continuous
  - [ ] Past Continuous
  - [ ] Present Perfect
- [ ] Контент (приоритет 3 — отдельный трек, не блокирует)
  - [ ] Future Continuous
  - [ ] Future Perfect
  - [ ] Past Perfect
  - [ ] Present Perfect Continuous
  - [ ] Past Perfect Continuous
  - [ ] Future Perfect Continuous
- [ ] На экране wrong-answer: кнопка «Учить это время» → `/learn/{tense-id}`
- [ ] После Learn: кнопка «Вернуться к игре»
- [ ] `features/report-error/` — кнопка на каждом вопросе и learn-странице
  - [ ] Модалка с textarea
  - [ ] Сохранять в `StorageService` (localStorage-очередь) — POST в Supabase в Phase 9
  - [ ] Toast-подтверждение

---

## 7. Daily Challenge (Browser API, date-seeded)

> Не нужен cron-сервер. Детерминированный сид по дате даёт всем одинаковый набор.

- [ ] Алгоритм: `seed = YYYY-MM-DD` → seeded random → выбрать 15 вопросов из банка
- [ ] Одна попытка в день — трекинг через `StorageService` (дата последнего прохождения)
- [ ] Маршрут `/daily` — те же компоненты что Normal mode
- [ ] **Стрик**
  - [ ] Трекинг последовательных дней с завершённым Daily (localStorage)
  - [ ] Flame-индикатор в nav-bar
- [ ] **Шаринг** (`features/daily-share/`)
  - [ ] HTML Canvas → PNG result card (дата, emoji-паттерн, счёт, ссылка)
  - [ ] Web Share API + clipboard fallback

---

## 8. Backend: Netlify + Supabase + Auth

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

## 9. Rank Mode

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

## 10. Лидерборды + Статистика

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

## 11. Монетизация

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

## 12. Text Analysis Mode

> Полностью клиентский — мог бы быть раньше, но сфокусируемся на core сначала.

- [ ] Маршрут `/text-analysis`
- [ ] Textarea для вставки текста + кнопка «Analyze»
- [ ] NLP-парсер на клиенте (`compromise.js` или regex по шаблонам)
  - [ ] Каждый конструкт → `<span class="tense-{id}">`
- [ ] Цветовая подсветка (та же палитра)
- [ ] Клик/тап → tooltip с объяснением (pre-written per tense pattern)
- [ ] *(Позднее)* AI-powered объяснения через Claude API

---

## 13. PWA + Service Worker

- [ ] `@angular/service-worker`
- [ ] `manifest.webmanifest` (icon, name, theme color)
- [ ] Кэширование оффлайн: learn-страницы + вопросы
- [ ] Responsive: Home grid 2×6 на мобайл, крупный текст

---

## 14. Визуальная полировка

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

## 15. Звуковой дизайн

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
- [ ] Learn-страницы приоритет 3 (Future Continuous, Perfect, Perfect Continuous)
- [ ] Daily Challenge cron (Supabase Edge Function — серверный генератор для честности, заменяет date-seed после Phase 8)
