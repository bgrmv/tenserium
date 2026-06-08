# Supabase Schema

Database schema for Tenserium. Deployed in Phase 9 (Accounts & Cloud Sync).

Currently (Phases 1–8), all state lives in `localStorage` via `StorageService` abstraction.

---

## Tables

### `users`

Core user profile and progression state.

```sql
CREATE TABLE users (
  id               UUID PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  nickname         TEXT UNIQUE,
  is_premium       BOOLEAN DEFAULT false,
  league           TEXT NOT NULL DEFAULT 'elementary',  -- elementary | intermediate | advanced
  cefr_level       TEXT NOT NULL DEFAULT 'a1',           -- a1 | a2 | b1 | b2 | c1 | c2
  rank_tier        TEXT NOT NULL DEFAULT 'iv',           -- i | ii | iii | iv (within CEFR level)
  rank_points      INT DEFAULT 0,                        -- 0–100, overflow advances tier
  daily_rank_matches INT DEFAULT 0,                      -- resets daily
  daily_challenge_date DATE,                             -- date of last completed daily challenge
  daily_streak_count INT DEFAULT 0,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);
```

**RLS:** User can read/update own record only.

---

### `sessions`

Game session history (Normal + Rank modes).

```sql
CREATE TABLE sessions (
  id               UUID PRIMARY KEY,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  mode             TEXT NOT NULL,                         -- normal | rank | daily
  score            INT NOT NULL,
  accuracy         FLOAT NOT NULL,                        -- 0.0–1.0
  avg_response_ms  INT,
  max_streak       INT,
  duration_ms      INT,
  created_at       TIMESTAMP DEFAULT now()
);
```

**RLS:** User can read own sessions.

---

### `session_answers`

Per-answer detail for each session (for stats + replay).

```sql
CREATE TABLE session_answers (
  id               UUID PRIMARY KEY,
  session_id       UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id      UUID REFERENCES questions(id),
  question_order   INT,                                   -- ordinal in session
  tense_id         TEXT NOT NULL,                         -- f1–f12 equivalent
  response_ms      INT NOT NULL,
  is_correct       BOOLEAN NOT NULL,
  submitted_at     TIMESTAMP DEFAULT now()
);
```

**RLS:** User can read own.

---

### `questions`

Canonical question bank.

```sql
CREATE TABLE questions (
  id               UUID PRIMARY KEY,
  tense_id         TEXT NOT NULL,                         -- ps | pc | pp | ... | fpc
  type             TEXT NOT NULL,                         -- sentence | context
  prompt           TEXT NOT NULL,
  language         TEXT NOT NULL DEFAULT 'en',            -- en | ru | ... (for future)
  difficulty       INT NOT NULL,                          -- 1 | 2 | 3
  league           TEXT,                                  -- elementary | intermediate | advanced | null = all
  flagged_count    INT DEFAULT 0,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);
```

**Indexes:** `(tense_id, league, difficulty)` for efficient question sampling.

**RLS:** All authenticated users can read.

---

### `matches`

Squad battle records.

```sql
CREATE TABLE matches (
  id               UUID PRIMARY KEY,
  league           TEXT NOT NULL,                         -- elementary | intermediate | advanced
  cefr_level       TEXT NOT NULL,                         -- a1 | a2 | b1 | ... | c2
  tier             TEXT NOT NULL,                         -- i | ii | iii | iv
  status           TEXT NOT NULL DEFAULT 'active',        -- active | completed
  question_ids     UUID[],                                -- 15 ticket IDs
  created_at       TIMESTAMP DEFAULT now(),
  completed_at     TIMESTAMP
);
```

**Indexes:** `(league, cefr_level, status, created_at)` for matchmaking queue.

**RLS:** Matches are public (spectate enabled in future phase).

---

### `match_players`

Players in a match + their answers.

```sql
CREATE TABLE match_players (
  id               UUID PRIMARY KEY,
  match_id         UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,  -- null for bots
  is_bot           BOOLEAN DEFAULT false,
  bot_accuracy     FLOAT,                                         -- 0.7 | 0.78 | 0.85
  bot_delay_min_ms INT,                                          -- per bot difficulty
  bot_delay_max_ms INT,
  final_score      INT,
  final_position   INT,                                          -- 1 | 2 | 3 | 4
  rank_points      INT,                                          -- 50 | 30 | 15 | 0
  created_at       TIMESTAMP DEFAULT now()
);
```

**RLS:** User can read own matches, all users can read completed matches.

---

### `match_answers`

Per-answer detail within a match (for combo tracking, replay).

```sql
CREATE TABLE match_answers (
  id               UUID PRIMARY KEY,
  match_id         UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id        UUID REFERENCES match_players(id),
  question_order   INT,                                   -- which ticket in match
  sentence_idx     INT,                                   -- for multi-sentence tickets
  tense_id         TEXT NOT NULL,
  response_ms      INT NOT NULL,
  is_correct       BOOLEAN NOT NULL,
  points_earned    INT,
  combo_length     INT,                                   -- at time of answer
  submitted_at     TIMESTAMP DEFAULT now()
);
```

---

### `daily_challenge`

One entry per day — shared seed for all players.

```sql
CREATE TABLE daily_challenge (
  date             DATE PRIMARY KEY,
  seed             TEXT NOT NULL UNIQUE,                  -- sha256(date + SECRET)
  question_ids     UUID[],
  difficulty_avg   FLOAT,
  created_at       TIMESTAMP DEFAULT now()
);
```

Generated by Edge Function cron at 00:00 UTC.

**RLS:** All authenticated can read current & past.

---

### `error_reports`

User-reported content issues.

```sql
CREATE TABLE error_reports (
  id               UUID PRIMARY KEY,
  question_id      UUID REFERENCES questions(id),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  description      TEXT NOT NULL,
  category         TEXT,                                  -- typo | ambiguous | incorrect | other
  created_at       TIMESTAMP DEFAULT now()
);
```

**RLS:** User can create own, moderators can read all.

---

### `feedback`

Feature requests & general feedback.

```sql
CREATE TABLE feedback (
  id               UUID PRIMARY KEY,
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  category         TEXT,                                  -- feature | bug | suggestion | other
  description      TEXT NOT NULL,
  email            TEXT,
  created_at       TIMESTAMP DEFAULT now()
);
```

---

## Views & Functions

### Materialized View: `leaderboard`

Top 100 users by total rank points.

```sql
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  u.id,
  u.nickname,
  u.league,
  u.cefr_level,
  u.rank_tier,
  u.rank_points,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(CASE WHEN sa.is_correct THEN 1 END)::FLOAT /
  COUNT(*) as overall_accuracy,
  ROW_NUMBER() OVER (ORDER BY u.rank_points DESC) as rank_global
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id AND s.mode = 'rank'
LEFT JOIN session_answers sa ON s.id = sa.session_id
GROUP BY u.id
ORDER BY u.rank_points DESC
LIMIT 100;

CREATE INDEX leaderboard_rank_global ON leaderboard(rank_global);
```

Refreshed hourly via cron Edge Function.

### Materialized View: `weekly_leaderboard`

Reset every Monday 00:00 UTC.

```sql
CREATE MATERIALIZED VIEW weekly_leaderboard AS
SELECT
  u.id,
  u.nickname,
  u.league,
  u.rank_tier,
  SUM(s.score) as weekly_total_score,
  ROW_NUMBER() OVER (ORDER BY SUM(s.score) DESC) as rank_weekly
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
  AND s.mode = 'rank'
  AND s.created_at >= date_trunc('week', now() - INTERVAL '1 day')
GROUP BY u.id
ORDER BY weekly_total_score DESC;
```

---

## Edge Functions

### `validate_answer` (HTTP POST)

Called by client after each match answer submission.

```typescript
// POST /validate_answer
// Body: { match_id, player_id, tense_id, response_ms, sentence_idx }
// Returns: { isCorrect, pointsEarned, leaderboardUpdated }

const { match_id, player_id, tense_id, response_ms, sentence_idx } = req.body;

// 1. Fetch question from DB
// 2. Validate tense_id vs question
// 3. Calculate points (scorer function)
// 4. Update match_answers + player score
// 5. Check if match complete → finalize ranks
// 6. Update user rank_points if earned
// 7. Return result
```

Called via Supabase Realtime after each answer.

### `generate_daily_challenge` (Scheduled)

Cron job: every day at 00:00 UTC.

```typescript
// 1. Generate seed = sha256(today_date + SECRET)
// 2. Deterministic sample 15 questions from pool (seeded random)
// 3. Insert into daily_challenge table
// 4. Broadcast to all connected clients via Realtime
```

---

## Migration Path (Phase 9)

### Step 1: Deploy Schema

```bash
supabase migration new init_schema
supabase db push
```

### Step 2: Update StorageService

Replace localStorage implementation with Supabase client:

```typescript
// Before (Phase 1–8)
export class StorageService {
  save(key: string, data: any) { localStorage.setItem(...) }
  load(key: string) { return JSON.parse(localStorage.getItem(...)) }
}

// After (Phase 9+)
export class StorageService {
  async save(key: string, data: any) { 
    await this.supabase.from('sessions').insert([...])
  }
  async load(key: string) { 
    return (await this.supabase.from('sessions').select()).data
  }
}
```

### Step 3: One-Time Sync

On first login, migrate localStorage sessions to Supabase:

```typescript
const { data: localSessions } = storage.loadAll('session:*');
await Promise.all(
  localSessions.map(s => supabase.from('sessions').insert(s))
);
storage.clear();
```

---

## Related Files

- **Migrations**: `supabase/migrations/`
- **Generated types**: `src/lib/supabase.types.ts` (from `supabase gen types`)
- **Client**: `src/shared/api/supabase.client.ts`
- **Storage abstraction**: `src/shared/api/storage.service.ts`
