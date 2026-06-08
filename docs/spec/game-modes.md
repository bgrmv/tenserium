# Game Modes

Three primary modes: Normal, Rank, and Daily Challenge.

---

## Normal Mode

**Access:** Public, no account required.

### Session Config

Player chooses before starting:

| Option | Default | Values |
|--------|---------|--------|
| Tense selection | All 12 | Quick: PS+PaS, Custom: user picks, All: all 12 |
| Session length | Standard | Quick (10), Standard (20), Marathon (40) |

### Question Format

- **Sentence → Tense**: "Do I know?" → F1 (PS)
- **Context → Tense** (Russian): "Действие, завершённое до другого события в прошлом" → F7 (PaP)

Difficulty: 1, 2, or 3 (affects base score).

### Flow

```
[Config] → [Questions] → [Result Flash] → [Next] → ... → [Summary]
```

- No pause between questions — next appears instantly after answer
- Result flash: 1 second (green ✓ or red ✗)
- Auto-skip if timeout after 10s (0 points, no penalty)
- Session saved to localStorage after completion

### End-of-Session Summary

- Total score, accuracy %, avg response time
- Bar chart: accuracy per tense
- Highlight weakest tense with "Learn this" button
- "Play again" / "Back to home" buttons

---

## Rank Mode

**Access:** Requires account (free tier allows 5 matches/day, Premium unlimited).

### Initial Placement

See [[domain-league#initial-placement-onboarding|Initial Placement]].

### Session Config

Automatic:
- Tenses: all unlocked at current CEFR level
- Length: fixed at 15 tickets per match
- Opponent search: matchmaking by league ± 1 tier

### Squad Battle (4 players)

All players see the same set of questions. Answers are submitted independently.

#### Ticket Format by League

**Elementary (A1, A2):**
- 1 sentence, 1 answer (F-key)
- Example: "Do I play?" → F1
- Base: 2 points per correct

**Intermediate (B1, B2):**
- 2–3 sentences, multiple answers
- Example: "I work every day. He is working now." → F1, F2
- Base: 4–6 points per ticket

**Advanced (C1, C2):**
- 4–5-sentence narrative, combo chain
- Example: "I work here. I am working on a project. I have been working since noon. What about you?"
- Player submits: F1 · F3 · F4 · [awaiting]
- Base: 8–15 points per ticket
- UI shows progress: `F1 · F3 · F4 · ?`

#### Scoring

See [[domain-scoring#rank-mode-squad-battle|Scoring > Rank Mode]].

Key rules:
- Position bonus (1st correct gets ×1.5)
- Wrong answer: −base, 500ms lock, streak reset
- Advanced: combo breaks don't erase prior earned points

#### Real-Time HUD

`widgets/squad-board/` shows all 4 players:
- Avatar, nickname, current score, current rank
- Tense answers as colored dots (correct/wrong/pending)
- Animations: green flash on correct, red shake on wrong, streak counter

### End-of-Match Results

- Final scores, ranking (1st–4th)
- Rank points earned (50 / 30 / 15 / 0)
- EXP bar progression toward next tier
- MVP badge for highest scorer
- Offer: play again or return to home

---

## Daily Challenge

**Access:** Public, but once per calendar day per device (localStorage-tracked).

### Challenge Generation

Deterministic seeding by date — all players on 2026-06-08 get the same 15 questions.

```typescript
seed = sha256('2026-06-08' + APP_SECRET)
questions = sampleQuestions(seed, 15)
```

Replaces server-side cron in Phase 8+ (when Supabase available).

### Attempt Rules

- One attempt per calendar day
- Completion tracked in localStorage: `{ date: '2026-06-08', score: 850, accuracy: 0.87 }`

### Summary & Share

After completing Daily:

1. **Result Card** (Canvas-rendered):
   ```
   🔥 DAILY CHALLENGE 🔥
   June 8, 2026
   Score: 850 • Accuracy: 87%
   ⭐⭐⭐⭐⭐ 🟢🟢🟢🟢🔵
   
   [Challenge yourself] →  [URL]
   ```

2. **Share options**:
   - Web Share API (`navigator.share()`)
   - Copy emoji pattern to clipboard (fallback)
   - Direct link with ?daily=2026-06-08

### Streak Tracking

Consecutive days with completed Daily:

- Stored: `{ lastDate: '2026-06-08', count: 15 }`
- Break streak on missed day → reset to 0
- UI: flame icon 🔥 in topbar showing streak count

---

## Shared Mechanics

### Hotkeys & Mobile

**Desktop:** F1–F12 (configurable in Phase 15+)

**Mobile:** On-screen buttons auto-disable hotkeys on small viewports.

### Timeout Behavior

- Window: 10s (Normal) or 8s (Rank)
- At timeout: auto-skip with 0 points
- No penalty, no streak break (just reset)

### Response Time Tracking

All answers record `responseMs` — time from question appearance to submission.

Used for:
- Speed bonus calculation
- Statistics (avg speed per tense)
- Heatmap visualization (Phase 11+)

### Storage

All session data flows through `StorageService` (abstraction for localStorage / Supabase).

```typescript
storage.save('session:2026-06-08T14:23:00Z', {
  mode: 'normal',
  score: 850,
  accuracy: 0.87,
  answers: [
    { questionId: 'q1', tenseId: 'ps', responseMs: 1200, isCorrect: true },
    // ...
  ]
});
```

Migration to Supabase in Phase 9 requires no code changes at feature level.

---

## Related Files

- **Config**: `src/shared/config/questions/`
- **Session store**: `src/entities/session/model/game-session.store.ts`
- **Matchmaking**: `src/entities/match/model/match.store.ts`
- **Game page**: `src/pages/game/ui/game.page.ts`
- **Daily store**: `src/entities/daily/model/daily.store.ts`
