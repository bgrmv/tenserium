# Tenserium

**Tenserium** is a speed-based interactive trainer for English tenses. The goal is simple: make tense recognition a reflex, not a thought exercise.

Designed for the modern generation — fast-paced, visually rich, competitive, and social.

---

## The Problem

Most learners can recite grammar rules — but freeze when they need to choose the right tense in real time. The gap between knowing the rules and using them automatically is a matter of practice volume and decision speed. Tenserium closes that gap.

---

## Audience

**Primary language:** Russian (first release). Expansion to other languages planned.

**Levels:** Beginner / Intermediate / Advanced — all can play in Normal mode from day one. In Rank mode, progression gates content by skill.

**Target demographic:** Modern learners who expect polished UI, satisfying sounds, smooth animations, and competitive mechanics.

---

## Modes

### Normal Mode

Open to everyone, no restrictions. All 12 tenses available from the start.

- Wrong answer → instant skip to next question (default)
- Optional: show explanation after wrong answer
- No matchmaking pressure — play at your own pace

### Rank Mode

Competitive, progression-gated:

- Starts with the first 2–3 tenses (e.g. Present Simple, Past Simple)
- Unlock additional tenses by accumulating points
- Points influence matchmaking — players are matched by skill rating
- **Squad battle:** up to 4 players compete simultaneously on speed (inspired by Quizz-style mechanics)
- Scripted bots fill empty slots when human opponents are unavailable; AI-powered bots are a later milestone

---

## Core Mechanic

The player is shown a prompt — a sentence, a fragment, or a contextual description — and must identify the correct English tense as fast as possible by pressing a hotkey (web) or tapping a button (mobile).

```
Prompt:   "Do I know?"
Press:    F1  →  Present Simple  ✓
```

```
Prompt:   "Действие, завершённое до другого события в прошлом"
Press:    F7  →  Past Perfect  ✓
```

Default binding: F1–F12 mapped to the 12 English tenses (configurable).  
On mobile: on-screen buttons replace hotkeys.

Contextual descriptions are in **Russian** for the first release; English UI toggle comes later.

---

## Challenge Formats

| Format | Description |
|--------|-------------|
| **Sentence → Tense** | An English sentence is shown; identify its tense |
| **Context → Tense** | A Russian usage description is shown; choose the matching tense |

Planned additions:
- Fill-in-the-blank (choose the correct verb form)
- Translation prompt
- Timed sprint: maximum correct answers in 60 seconds
- More time-limited formats to come

---

## Difficulty & Progression

Tenses are introduced gradually:

1. Present Simple, Past Simple
2. Future Simple, Present Continuous
3. …up to all 12 tenses

In Normal mode a player can choose which tenses to include in the session.  
In Rank mode the pool expands automatically as the player earns points.

---

## Tense Coverage

All 12 English tenses across 3 time periods and 4 aspects:

|                  | Simple | Continuous | Perfect | Perfect Continuous |
|------------------|--------|------------|---------|-------------------|
| **Present**      | ✓      | ✓          | ✓       | ✓                 |
| **Past**         | ✓      | ✓          | ✓       | ✓                 |
| **Future**       | ✓      | ✓          | ✓       | ✓                 |

---

## Scoring

Points are calculated per answer:

- **Base score** for a correct answer
- **Speed bonus** — linear decay from max to 0 over the answer window (faster = more points)
- **Streak multiplier** — consecutive correct answers increase the multiplier (×1 → ×2 → ×3 …)
- **Difficulty weight** — rarer or harder tenses yield more base points

Incorrect answers reset the streak. Points feed both the leaderboard and Rank mode progression.

---

## Accounts & Progress

- **Anonymous play** is available without registration — progress is stored locally
- **Account creation** (email or social login: Google, Apple) syncs progress to the cloud and unlocks Rank mode and leaderboards
- Stats, rank, and unlocks are tied to the account

---

## Daily Mechanics

- **Daily Challenge** — a fixed set of questions, identical for all players on a given day; shareable result card
- **Streak** — daily login and play streak tracked per account
- Notifications: in-app only for the web version; push notifications planned for the future mobile app

---

## Content

Each tense has a dedicated question bank: sentences and contextual prompts written manually.  
Questions are reviewed and expanded over time — AI assistance for quality control is a later milestone.  
Players can flag errors directly from any question screen — every question has a **"Report error"** button.

---

## Player Statistics

The game tracks per-player:

| Metric | Description |
|--------|-------------|
| **Decision speed** | Average response time per tense |
| **Accuracy** | Correct answer rate per tense |
| **MVP count** | Wins in multiplayer squad battles |
| **Total points** | Cumulative score across all sessions |

Statistics inform matchmaking and are displayed on the personal profile page.

---

## Visual Identity

- **Theme:** Dark-first, with a clean modern look — not childish, not corporate
- **Color system:** Each tense has a unique accent color used consistently across the grid, learn pages, and text analysis highlighting
- **Motion:** Micro-animations on answer confirmation, smooth transitions between questions, satisfying sound effects on correct/wrong/streak events
- **Typography:** Modern sans-serif; large, readable prompt text

---

## Learn Section

Independent from the game — no requirement to study before playing.

- Home grid shows all 12 tenses
- Each tense has a dedicated **Learn** page: grammar rules, examples, time markers, context, FAQ
- Players can jump from a wrong answer directly to the relevant Learn page

---

## Text Analysis Mode *(planned)*

A passive study tool — no questions, no timer. The player pastes any English text and the app:

1. Highlights each verb construction by tense (color-coded, same palette as the rest of the app)
2. Lets the player tap/click any highlighted phrase to see an inline explanation: which tense it is and why it is used here

Explanations are pre-written per tense pattern in the first version; AI-powered contextual explanations are a later milestone.

Use cases: song lyrics, news articles, book excerpts, personal writing. Bridges real-world reading and structured grammar knowledge.

---

## Monetization

**Freemium model:**

| Feature | Free | Premium |
|---------|------|---------|
| Normal mode (all tenses) | ✓ | ✓ |
| Learn pages | ✓ | ✓ |
| Daily Challenge | ✓ | ✓ |
| Rank mode (limited matches/day) | ✓ | ✓ unlimited |
| Detailed statistics | Basic | Full |
| Cosmetics (avatar frames, sound packs) | — | ✓ |
| Ads | Yes | No |

Core learning content stays free. Premium rewards engagement, not access.

---

## Feedback

- **Feedback page:** a structured "book of complaints and suggestions" for feature requests and general feedback
- **Report error button:** on every question, for flagging incorrect or ambiguous content

---

## Platform

| Platform | Status |
|----------|--------|
| Web (desktop) | Primary — hotkey-first UX |
| Mobile (web / native) | Planned — on-screen tense buttons |

---

## Product Vision

Tenserium turns tense recognition into a skill built through thousands of fast, low-stakes decisions — the same way musicians internalize scales or chess players pattern-match positions.

The competitive layer (rank, squad battles, leaderboards) turns solo drilling into a social experience. The learn layer makes the trainer self-contained. Together they form a complete environment for English tense mastery.

---

## Rank System

> **TODO:** Tier names, promotion/demotion rules, and ELO vs fixed-tier approach are not yet decided.
>
> *Suggestion:* Use named tiers (e.g. Rookie → Scholar → Expert → Master → Grandmaster) with visible progress bars rather than a raw ELO number — friendlier for a learning audience. Demotion is possible but protected by a grace zone (e.g. you need to lose 3 matches in a row at the bottom of a tier before dropping). Season resets partially (soft reset to a midpoint tier) to keep competition alive each season.

---

## Squad Battle Mechanics

> **TODO:** The exact answer mechanic for multiplayer is not decided — buzzer vs. independent.
>
> *Suggestion:* All 4 players see the same question simultaneously. Each answers independently — no buzzer. Points are awarded based on correctness + speed: first correct answer gets full points, second gets slightly fewer, etc. Wrong answers give zero and briefly lock the player out of the current question. This avoids the "lucky first click" problem of a pure buzzer and keeps all players engaged for every question.

---

## Session Structure

> **TODO:** Number of questions per round and pacing between questions are not defined.
>
> *Suggestion:*
> - Normal mode: player chooses session length (Quick = 10 questions, Standard = 20, Marathon = 40)
> - Rank mode: fixed at 15 questions per match, same for all players in the squad
> - No pause between questions — next question appears immediately after answering (or after a 1-second result flash)
> - End-of-session summary screen: score, accuracy, speed chart, weakest tense highlighted

---

## Onboarding

> **TODO:** First-launch experience is not designed yet.
>
> *Suggestion:* Skip the tutorial wall. Show a single demo question with animated hints (highlight the hotkeys, show what a correct answer looks like), then drop the player straight into a 5-question Normal mode sample. At the end of the sample, prompt account creation with the benefit ("save your progress and unlock Rank mode") — not before. No forced level selection on first launch; the system infers level from early performance.

---

## Leaderboards

> **TODO:** Leaderboard scope and time windows are not defined.
>
> *Suggestion:* Three tabs — **Global** (all-time top 100), **Weekly** (resets every Monday, motivates casual players), **Friends** (requires account + social graph). Per-tense leaderboards are a future feature, not MVP.

---

## Sound Design

> **TODO:** Sound direction is not defined.
>
> *Suggestion:* Modern UI sounds — clean, short, satisfying. Not retro 8-bit, not Duolingo-cartoon. Think: a subtle whoosh on question appear, a bright "ping" on correct answer, a low dull thud on wrong, an escalating chime sequence on a streak. Volume off by default on web (respect browser autoplay norms), with a toggle in the top bar.

---

## Current State

- Learn page for **Present Simple** (grammar, examples, time markers, FAQ)
- Home grid showing all 12 tenses
- Exam interface scaffolded (game implementation in progress)
