# Scoring System

Алгоритм начисления очков в зависимости от режима и типа ответа.

---

## Normal Mode

### Per-Answer Score Formula

```
points = base × speedBonus × streakMultiplier

where:
  base           = 100 × difficulty        // difficulty ∈ {1, 2, 3}
  speedBonus     = max(0, 1 - t/windowMs)  // linear decay from 1 to 0
  windowMs       = 10000                   // 10 seconds
  streakMultiplier = min(streak, 5)        // capped at ×5
```

### Examples

**Question: Present Simple (difficulty=1)**
- Correct answer in 2000 ms: `100 × 1 × (1 - 2000/10000) × 1 = 100 × 0.8 = 80 pts`
- Correct answer in 8000 ms: `100 × 1 × (1 - 8000/10000) × 1 = 100 × 0.2 = 20 pts`
- Correct answer after 10s (timeout): `0 pts` (auto-skip)

**With Streak (streak=3)**
- Same question in 2000 ms: `100 × 0.8 × 3 = 240 pts`

### Streak Rules

- **Correct answer**: increment streak, apply multiplier
- **Wrong answer**: reset streak to 0, give 0 points
- **Timeout**: reset streak, give 0 points (no penalty)

### Session Stats

Computed from all answers in the session:
- `totalScore` — sum of all points
- `accuracy` — (correct / total) × 100%
- `avgResponseTime` — mean response_ms for correct answers
- `maxStreak` — highest consecutive correct answers

---

## Rank Mode (Squad Battle)

### Per-Ticket Score Formula

Различается в зависимости от лиги.

```
points = ticketBase × speedBonus × positionBonus × streakMultiplier

where:
  ticketBase     = leagueBase × difficulty
  speedBonus     = max(0, 1 - t/windowMs)
  windowMs       = 8000                    // slightly faster than Normal
  positionBonus  = 1.5 for 1st correct, 1.0 for 2nd, 0.7 for 3rd+ // rank by time
  streakMultiplier = min(comboLength, 5)
```

### League-Specific Base

| League | ticketBase | windowMs | Ticket Format |
|--------|-----------|----------|---------------|
| Elementary | 2 | 8000 | 1 sentence, 1 answer |
| Intermediate | 4–6 | 8000 | 2–3 sentences, multiple answers |
| Advanced | 8–15 | 8000 | 4–5 narrative sentences, combo chain |

### Wrong Answer Rules

- **Elementary / Intermediate**: −ticketBase, freeze combo, 500ms lock, reset multiplier to 1
- **Advanced (combo chain)**: 
  - Earned points before error are kept
  - −ticketBase for this particular sentence
  - 500ms lock on input
  - Combo multiplier resets to 1 for next correct answer
  - All *previous* sentences in the chain already scored and committed

### Position Bonus (First Correct Advantage)

When multiple players answer correctly on the same ticket:
- **1st to submit correct**: +50% multiplier = ×1.5
- **2nd to submit correct**: ×1.0 (baseline)
- **3rd+ to submit correct**: ×0.7

This rewards speed without making late answers worthless.

### Timeout

- No answer submitted within `windowMs`: 0 points, no penalty, no lock, multiplier not reset

### Example: Advanced League, Combo-Broken

4-sentence narrative, player answers: F1 (✓), F2 (✓), F3 (✗), F4 (✓)

```
Sentence 1: +( 12 × 0.9 × 1.0 × 1 ) = 10.8 pts  [1st correct → ×1.5]
Sentence 2: +( 12 × 0.7 × 1.0 × 2 ) = 16.8 pts  [2nd correct → ×1.0, combo=2]
Sentence 3: −12 pts                              [wrong → −base, freeze combo]
Sentence 4: +( 12 × 0.6 × 1.0 × 1 ) = 7.2 pts   [new combo chain]
────────────────────────────────────────────────
Total: 10.8 + 16.8 − 12 + 7.2 = 22.8 pts
```

No punishment for the combo break beyond −ticketBase — the player keeps prior earnings.

---

## Rank Points (Progression)

Separate from session score. Used for tier advancement.

| Outcome | Rank Points |
|---------|------------|
| Match win (highest score) | +50 |
| 2nd place | +30 |
| 3rd place | +15 |
| 4th place / loss | +0 |
| Loss streak (3 losses in a row at tier `-IV`) | −20 |

**Tier Advancement**: 0–100 points = advance one sub-tier (A1-IV → A1-III).

---

## Storage

Scores are saved in `shared/lib/scoring.ts`:

```typescript
calcPoints(params: {
  isCorrect: boolean;
  responseMs: number;
  windowMs: number;
  difficulty: 1 | 2 | 3;
  streak: number;
  leagueBase?: number;        // for Rank mode
  positionBonus?: number;     // for multi-player
}): number
```

Tested in `src/shared/lib/scoring.spec.ts`.
