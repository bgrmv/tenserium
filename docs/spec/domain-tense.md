# Tense Domain

12 English tenses across 3 time periods and 4 aspects. Primary source of truth: `src/shared/config/tenses.config.ts`.

---

## Tense Matrix

|                  | Simple | Continuous | Perfect | Perfect Continuous |
|------------------|--------|------------|---------|-------------------|
| **Present**      | PS     | PC         | PP      | PPC                |
| **Past**         | PaS    | PaC        | PaP     | PaPC               |
| **Future**       | FS     | FC         | FP      | FPC                |

---

## Full Reference Table

| ID | Name | Full Name | Time | Aspect | Hotkey | Structure | Example |
|----|------|-----------|------|--------|--------|-----------|---------|
| 0 | PS | Present Simple | Present | Simple | F1 | S/V/O | *I work* |
| 1 | PC | Present Continuous | Present | Continuous | F2 | am/is/are + V-ing | *I am working* |
| 2 | PP | Present Perfect | Present | Perfect | F3 | have/has + V-ed | *I have worked* |
| 3 | PPC | Present Perfect Continuous | Present | Perfect Continuous | F4 | have/has + been + V-ing | *I have been working* |
| 4 | PaS | Past Simple | Past | Simple | F5 | V-ed / irregular | *I worked* |
| 5 | PaC | Past Continuous | Past | Continuous | F6 | was/were + V-ing | *I was working* |
| 6 | PaP | Past Perfect | Past | Perfect | F7 | had + V-ed | *I had worked* |
| 7 | PaPC | Past Perfect Continuous | Past | Perfect Continuous | F8 | had + been + V-ing | *I had been working* |
| 8 | FS | Future Simple | Future | Simple | F9 | will + V / be going to + V | *I will work* |
| 9 | FC | Future Continuous | Future | Continuous | F10 | will + be + V-ing | *I will be working* |
| 10 | FP | Future Perfect | Future | Perfect | F11 | will + have + V-ed | *I will have worked* |
| 11 | FPC | Future Perfect Continuous | Future | Perfect Continuous | F12 | will + have + been + V-ing | *I will have been working* |

---

## Hotkey Binding

Default: F1–F12 (in order). User can customize via settings page (Phase 15+).

```typescript
// src/shared/config/tenses.config.ts
export const TENSES = [
  { id: 'ps', order: 0, hotkey: 'F1', name: 'Present Simple', ... },
  { id: 'pc', order: 1, hotkey: 'F2', name: 'Present Continuous', ... },
  // ... etc
] as const;
```

Utility: `hotkeyToTense(key: string): TenseId | null`

---

## Tense Colors

Each tense has a unique accent color (oklch-based dark theme first).

Stored in `src/shared/config/tense-colors.ts`:

```typescript
export function tenseColor(tenseId: TenseId): OklchColor {
  const colors: Record<TenseId, OklchColor> = {
    ps: { l: 75, c: 0.16, h: 200 },   // cool blue
    pc: { l: 72, c: 0.18, h: 180 },   // cyan
    pp: { l: 70, c: 0.19, h: 160 },   // teal
    // ... etc
  };
  return colors[tenseId];
}
```

Applied via CSS custom properties:

```css
:root {
  --tense-ps: oklch(75% 0.16 200);
  --tense-pc: oklch(72% 0.18 180);
  /* ... */
}
```

Used in:
- Home grid (tense cell background)
- Game UI (answer button highlights)
- Learn page (accent borders, highlights)
- Text Analysis Mode (verb highlighting)

---

## CEFR-Based Unlock (Rank Mode)

Tenses are unlocked progressively by CEFR level, not by points.

| CEFR | Level | Unlocked Tenses |
|------|-------|-----------------|
| A1   | Elementary | PS, PaS |
| A2   | Elementary | + FS, PC |
| B1   | Intermediate | + PaC, PP |
| B2   | Intermediate | + PaP, FC, PPC |
| C1   | Advanced | + PaPC, FP |
| C2   | Advanced | FPC (complete set) |

Stored in `src/shared/config/cefr.config.ts`:

```typescript
export const TENSE_BY_CEFR: Record<CEFRLevel, TenseId[]> = {
  a1: ['ps', 'pas'],
  a2: ['ps', 'pas', 'fs', 'pc'],
  b1: ['ps', 'pas', 'fs', 'pc', 'pac', 'pp'],
  // ... etc
};
```

---

## Usage Markers

Time markers help learners remember when to use each tense (Learn page).

Example (Present Simple):
- **Habit / Routine**: "I drink coffee every morning"
- **General truth**: "The Earth orbits the Sun"
- **Schedule**: "The flight departs at 3 PM"

Stored in `src/assets/learn/{tenseId}.json`:

```json
{
  "id": "ps",
  "name": "Present Simple",
  "markers": [
    { "label": "Habit", "examples": [...] },
    { "label": "General truth", "examples": [...] }
  ]
}
```

---

## Difficulty Weight

In Normal Mode, tenses can have different difficulty levels (affects base score).

| Difficulty | Multiplier | Tenses (examples) |
|------------|-----------|------------------|
| 1 (easy) | ×1 | PS, PaS |
| 2 (medium) | ×2 | PC, PaC, PP, FS |
| 3 (hard) | ×3 | PaP, FP, PPC, PaPC, FPC, FC |

Applied during question generation (question bank has a `difficulty` field).

---

## Related Files

- **Config**: `src/shared/config/tenses.config.ts`
- **Colors**: `src/shared/config/tense-colors.ts`
- **CEFR mapping**: `src/shared/config/cefr.config.ts`
- **Learn content**: `src/assets/learn/*.json`
- **Question bank**: `src/assets/questions/*.json`
- **Helpers**: `src/shared/lib/cefr.ts`
