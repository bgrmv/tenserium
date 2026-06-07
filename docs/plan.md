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

## 3. FSD-рефакторинг

- [ ] Создать структуру папок согласно FSD
  ```
  src/
  ├── app/
  ├── pages/
  ├── widgets/
  ├── features/
  ├── entities/
  └── shared/
  ```
- [ ] Обновить `tsconfig.json` — path aliases для каждого слоя
  - [ ] `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`
- [ ] Настроить ESLint-правила на запрет импортов между слоями
- [ ] Перенести существующий код в FSD-структуру
  - [ ] `home-page.component` → `pages/home/`
  - [ ] `present-simple/` → `entities/learn/` + `entities/tense/`
  - [ ] Exam-скаффолд → `pages/game/`
- [ ] Создать `shared/config/tenses.config.ts` — массив 12 времён (id, hotkey F1–F12, color, order)
- [ ] Создать `shared/types/` — глобальные типы (`TenseId`, `Question`, `Session`, `UserProfile`)

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
  - [ ] `users` (id, nickname, is_premium, rank_tier, daily_rank_matches, created_at)
  - [ ] `questions` (id, tense_id, type, prompt, difficulty, created_at)
  - [ ] `sessions` (id, user_id, mode, score, duration_ms, created_at)
  - [ ] `session_answers` (session_id, question_id, is_correct, response_ms)
  - [ ] `daily_challenge` (date PK, question_ids[])
  - [ ] `error_reports` (id, question_id, user_id, description, created_at)
  - [ ] `matches` (id, player_ids[], state, scores, created_at)
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

- [ ] **Система рангов**
  - [ ] Тиры: Rookie → Scholar → Expert → Master → Grandmaster
  - [ ] Прогресс-бар внутри тира (0–100 очков)
  - [ ] Demotion: 3 поражения подряд на нижней границе = понижение
  - [ ] Сезонный soft-reset (раз в 3 месяца) → до середины тира
- [ ] **Разблокировка времён**
  - [ ] Стартовый пул: Present Simple + Past Simple
  - [ ] Каждые 50 ранговых очков: +1 время
  - [ ] UI: locked-overlay на карточках нераскрытых времён
- [ ] **Matchmaking**
  - [ ] При поиске: запись в `match_queue` с rank_tier
  - [ ] Edge Function (polling 2 сек): группировать ±1 тир → создать матч
  - [ ] Таймаут 15 сек → заполнить ботами
- [ ] **Scripted Bots**
  - [ ] `is_bot: true` в `match_players`
  - [ ] `randomDelay(800, 4000)` + configurable accuracy
- [ ] **Squad Battle** (Supabase Realtime)
  - [ ] Канал `match:{match_id}`
  - [ ] Broadcast `{ playerId, tenseId, responseMs }`
  - [ ] Edge Function валидирует и рассчитывает очки
  - [ ] Wrong answer → 500ms lock
  - [ ] 15 вопросов → result screen с позицией
- [ ] **`widgets/squad-board/`**
  - [ ] 4 аватар-слота, ник, текущий счёт
  - [ ] Анимация при правильном ответе

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
