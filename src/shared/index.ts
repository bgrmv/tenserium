// config
export type { TenseId, TenseConfig, Aspect, TimePeriod } from './config/tenses.config';
export { TENSES, ASPECT_ORDER, TIME_ORDER, ASPECT_LABEL, getTense, tensesByTime, hotkeyToTense } from './config/tenses.config';
export type { PaletteMode } from './config/tense-colors';
export { tenseColor, tenseCssVars, colorVarRef } from './config/tense-colors';
export { RANK_TIERS, rankTier, rankProgress } from './config/rank.config';

// types
export type {
  QuestionType, Difficulty, Sentence, Question,
  SessionMode, SessionStatus, SessionConfig, AnswerRecord,
  RankTier, RankProgress,
  ScoreDisplayPreference, UserProfile,
  Player, ScoreInput,
} from './types/index';

// api
export { StorageService } from './api/storage.service';

// lib
export { calcPoints } from './lib/scoring';
export { createGameTimer } from './lib/game-timer';
export type { GameTimer } from './lib/game-timer';
export { HotkeysService } from './lib/hotkeys.service';

// ui
export { IconComponent } from './ui/icon/icon.component';
export type { IconName } from './ui/icon/icon.component';
export { AvatarComponent } from './ui/avatar/avatar.component';
export { ProgressBarComponent } from './ui/progress-bar/progress-bar.component';
export { RankShieldComponent } from './ui/rank-shield/rank-shield.component';
export { LogoComponent } from './ui/logo/logo.component';
