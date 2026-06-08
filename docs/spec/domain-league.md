# League & Rank System

Progression system for Rank Mode. Divides players into 3 leagues with 8 sub-divisions each (24 tiers total).

---

## Structure

```
League Level          CEFR    IELTS    TOEFL iBT  Divisions (IV → I)
─────────────────────────────────────────────────────────────────────
Elementary     A1     3.0–4.0  32–45    A1-IV, A1-III, A1-II, A1-I
               A2     4.0–5.0  45–57    A2-IV, A2-III, A2-II, A2-I
Intermediate   B1     5.0–6.0  57–77    B1-IV, B1-III, B1-II, B1-I
               B2     6.5–7.0  77–94    B2-IV, B2-III, B2-II, B2-I
Advanced       C1     7.5–8.5  94–110   C1-IV, C1-III, C1-II, C1-I
               C2     8.5–9.0  110–120  C2-IV, C2-III, C2-II, C2-I
```

**Total: 6 CEFR levels × 4 sub-tiers = 24 steps**

---

## Initial Placement (Onboarding)

After completing 5-question sample during onboarding:

```
accuracy >= 80%  →  B1 (Intermediate)
accuracy 60–80%  →  A2 (Elementary upper)
accuracy < 60%   →  A1 (Elementary lower)
```

Player can manually downgrade before first Rank match, but not upgrade.

---

## Progression Within Division

**Points per match:**
- 1st place: +50 rank points
- 2nd place: +30 rank points
- 3rd place: +15 rank points
- 4th place (loss): +0 rank points

**Tier advancement:**
- Accumulate 0–100 rank points → auto-advance to next sub-tier
- E.g., A1-IV (0 pts) → get 50 pts on 1st match → A1-IV (50 pts)
- Get another 60 pts → A1-IV + 50 + 60 = 110 → overflow to A1-III (10 pts)

---

## Demotion

Only possible at the bottom sub-tier of a CEFR level (e.g., A1-IV, B1-IV).

- **3 losses in a row** at tier `-IV` → demote to previous CEFR level, top sub-tier
  - A1-IV after 3 losses → stays at A1-IV (no lower tier)
  - B1-IV after 3 losses → drops to A2-I

**Grace zone:** Demotion does not trigger until 3 consecutive losses (first loss doesn't immediately demote).

---

## Progression Between Leagues

Automatic on tier-up:
- **A2-I + 1 win → B1-IV** (enter next league at bottom)
- **B2-I + 1 win → C1-IV**
- **C2-I**: top of ladder, no further progression

---

## Seasonal Soft Reset

Every 3 months (configurable), all players reset to the **bottom sub-tier of their current CEFR level**:
- C1-II → C1-IV (keep CEFR, reset to `-IV`, start at 0 points)
- Motivation: keeps competitive even for top players

---

## Display & Equivalents

**Badge format:**
```
B2-II
~IELTS 6.5
```

**User preference:**
Player chooses which score system to display next to badge:
- `IELTS` (default)
- `TOEFL iBT`
- `Cambridge` (mapped to CEFR)
- `None`

Mapping stored in `src/shared/config/cefr.config.ts`:

```typescript
export const CEFREquivalents: Record<CEFRLevel, { ielts: number; toefl: number; cambridge: string }> = {
  a1: { ielts: 3.5, toefl: 32, cambridge: 'KET' },
  a2: { ielts: 4.5, toefl: 45, cambridge: 'PET' },
  b1: { ielts: 5.5, toefl: 72, cambridge: 'FCE' },
  // ... etc
};
```

Utility function: `getEquivalent(level: CEFRLevel, system: 'ielts' | 'toefl' | 'cambridge'): number | string`

---

## Matchmaking

When a player queues for Rank:

1. **Find players in same league and tier ±1** (e.g., B2-II searching finds B2-II, B2-III, B2-I)
2. **Timeout: 15 seconds** → fill empty slots with scripted bots
3. **Bot skill (per league)**:
   - **Elementary**: accuracy 70%, delay 1.2–3.5s
   - **Intermediate**: accuracy 78%, delay 0.9–3.0s
   - **Advanced**: accuracy 85%, delay 0.8–2.5s

Bots get full rank points for their placement.

---

## Locked Tenses UI

In Rank mode, home page shows all 12 tenses, but locked ones have an overlay:

```
[PS] [PC] [PP] [PPC]
[PaS] [PaC] [PaP] [PaPC]
[FS] [FC] [FP] [FPC]
^
├─ unlocked (current CEFR level)
└─ 🔒 locked (future CEFR level)
```

Tapping locked → explains: "Unlock at B1 level"

---

## Related Files

- **Config**: `src/shared/config/cefr.config.ts`
- **Helpers**: `src/shared/lib/cefr.ts`
- **UI Badge**: `src/shared/ui/division-badge/`
- **Page**: `src/pages/equivalents/` (full table + current highlight)
- **Store**: `src/entities/user/model/user.store.ts` (rank state)
