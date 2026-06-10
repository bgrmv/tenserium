# Changelog

## 0.0.1 (2026-06-10)


### Bug Fixes

* disable SSR for GitHub Pages static hosting ([f56c6e4](https://github.com/bgrmv/tenserium/commit/f56c6e4f172ae3bf9bb66e115835b53e1e5cdbc7))
* lint:fix ([2c078ae](https://github.com/bgrmv/tenserium/commit/2c078ae4ee889d8a8610e4f5ee6ca7b7eab8bf90))
* **lint:** rename close output to dismissed, add keyboard a11y to annotation spans ([762c4d7](https://github.com/bgrmv/tenserium/commit/762c4d7f75f8d712f65f7c76a8608b7af4263ea3))
* set baseHref in angular.json instead of CLI flag ([6a778cc](https://github.com/bgrmv/tenserium/commit/6a778cc3d28d9609acf44b6659b5ffcbf994fae5))
* **shared:** icon component visibility for stroke and fill modes ([9d6d96e](https://github.com/bgrmv/tenserium/commit/9d6d96ef182f5a3fe2467fb5ff35fa354e9c89ec))
* **tests:** Replace as any with as TenseId, remove inferred string type annotation ([69fa290](https://github.com/bgrmv/tenserium/commit/69fa290db0105731f6e26415734d334f22df27e3))


### Features

* **daily:** Phase 8 — Daily Challenge (browser API, date-seeded) ([4204683](https://github.com/bgrmv/tenserium/commit/42046833c5369bdbc51e4ae382e919c8e8b622a4))
* draw present simple scheme ([3f0a630](https://github.com/bgrmv/tenserium/commit/3f0a630478a6301f021022fe140f74560220d67f))
* **fsd:** Phase 3 — FSD refactor, TS paths, ESLint boundaries ([641703d](https://github.com/bgrmv/tenserium/commit/641703d0352f5e67d77948200cd4a0afdc0a3be8))
* init common template ([0dce940](https://github.com/bgrmv/tenserium/commit/0dce94012e3e0336ac10a941df8eefc36421f45d))
* init present-simple ([016a751](https://github.com/bgrmv/tenserium/commit/016a7519ecade62763178e6875d5b272ac9d5448))
* **pause:** add pause-before-next toggle with auto-show annotation ([6a75261](https://github.com/bgrmv/tenserium/commit/6a752614accc0db81d090ee5ddea2985aa6909b2))
* phase 1 — CI/CD pipeline with ESLint ([8133b08](https://github.com/bgrmv/tenserium/commit/8133b08c31e5ac3d0bf3304c5f5f8f4556f26bee))
* **phase-2:** migrate Angular 19→22, zoneless, remove SSR/zone.js ([e0814dd](https://github.com/bgrmv/tenserium/commit/e0814dd9407df9b99a26e7ba638e4074e8dddac7))
* **phase-2:** Vitest, remove Karma/Jasmine, fix TS6 deprecations ([9574dc3](https://github.com/bgrmv/tenserium/commit/9574dc30ae5ba2c78acd0bc61491fcffecdcbb7d))
* **phase-4:** Design integration — FSD migration + game engine infrastructure ([e00c156](https://github.com/bgrmv/tenserium/commit/e00c156b03f6950e26bf15ba8a32c1c8b695f207))
* **phase-6:** Onboarding flow — demo, 5-question session, save-prompt, skip button ([07603f5](https://github.com/bgrmv/tenserium/commit/07603f512f81bfa42abbbc978ea7cca6b6bc2352))
* **phase-7:** Learn pages — LearnDetailComponent, enriched content, report-error, study button ([e8e429f](https://github.com/bgrmv/tenserium/commit/e8e429f700d49e59f0cdfacd19f9d2451fe0497b))
* **shared:** add domain types Question, Session, UserProfile ([4985489](https://github.com/bgrmv/tenserium/commit/4985489df62ddc1d06011035a3ac299eff6b0e7a))
* **study:** study panel, distractors lib, and question-card spec ([5016c7b](https://github.com/bgrmv/tenserium/commit/5016c7b3c46db735c296e5b5e765daf01de9e326))
* **study:** tokenize question bank sentences with annotation support ([4ce62f3](https://github.com/bgrmv/tenserium/commit/4ce62f3a989613c6a96b1d204940e59dc94b7df5))

## [0.0.1] — 2026-06-10

### Added

- Initial project setup: Angular 22 zoneless, pnpm, GitHub Actions CI/CD (GitHub Pages deploy)
- FSD architecture with path aliases and ESLint layer enforcement
- Design system: oklch color tokens, Space Grotesk / IBM Plex Sans typography
- Game engine: Normal Mode, scoring, hotkeys F1–F12, signal-based timer, 87 questions across all 12 tenses
- Onboarding flow with inferred proficiency level and 5-question sample
- Learn pages for all 12 English tenses with grammar content and report-error modal
- Daily Challenge: LCG date-seed, one attempt per day, streak tracking, Canvas share card
- Versioning automation via release-it + conventional changelog (PolyForm Strict license)
