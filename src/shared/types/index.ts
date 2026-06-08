import type { Aspect } from '@shared/config/tenses.config';
import type { TenseId } from '@shared/config/tenses.config';

export type { TenseId } from '@shared/config/tenses.config';
export type { Aspect, TimePeriod, TenseConfig } from '@shared/config/tenses.config';

export type QuestionType = 'sentence' | 'context';
export type Difficulty = 1 | 2 | 3;

export interface Sentence {
  readonly pre: string;
  readonly verb: string;
  readonly post: string;
}

export interface Question {
  readonly id: string;
  readonly answer: TenseId;
  readonly type: QuestionType;
  readonly prompt: string;
  readonly promptEn?: string;
  readonly sentence: Sentence;
  readonly difficulty: Difficulty;
}

export type SessionMode = 'normal' | 'rank' | 'squad' | 'daily';

export type SessionStatus =
  | 'idle'
  | 'loading'
  | 'question'
  | 'result-flash'
  | 'summary';

export interface SessionConfig {
  readonly mode: SessionMode;
  readonly tenses: readonly TenseId[];
  readonly total: number;
  readonly windowMs: number;
  readonly modeMultiplier: number;
  readonly focusAspect?: Aspect;
}

export interface AnswerRecord {
  readonly questionId: string;
  readonly picked: TenseId | null;
  readonly correct: boolean;
  readonly responseMs: number;
  readonly points: number;
}

export type RankTier = 'rookie' | 'scholar' | 'expert' | 'master' | 'grandmaster';

export interface RankProgress {
  readonly tier: RankTier;
  readonly points: number;
  readonly intoTier: number;
  readonly tierSize: number;
}

export type ScoreDisplayPreference = 'ielts' | 'toefl' | 'cambridge' | 'none';

export interface UserProfile {
  readonly id: string;
  readonly nickname: string;
  readonly rankTier: RankTier;
  readonly rankPoints: number;
  readonly streakDays: number;
  readonly isPremium: boolean;
  readonly hasSeenOnboarding: boolean;
  readonly scoreDisplayPreference: ScoreDisplayPreference;
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly isBot: boolean;
  readonly avatarHue: number;
  readonly score: number;
  readonly answered: number;
}

export interface ScoreInput {
  readonly isCorrect: boolean;
  readonly responseMs: number;
  readonly windowMs: number;
  readonly streak: number;
  readonly difficulty: Difficulty;
  readonly modeMultiplier?: number;
}
