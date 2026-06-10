import type { Aspect } from '@shared/config/tenses.config';
import type { TenseId } from '@shared/config/tenses.config';

export type { TenseId } from '@shared/config/tenses.config';
export type { Aspect, TimePeriod, TenseConfig } from '@shared/config/tenses.config';

export type Difficulty = 1 | 2 | 3;

export interface LocalizedString {
  readonly en: string;
  readonly ru?: string;
}

export type TaskMechanism = 'context' | 'match' | 'fill-in' | 'multiple-choice';

export type League = 'elementary' | 'intermediate' | 'advanced';

export interface SentenceDistractor {
  readonly tenseId: TenseId;
  readonly reason?: LocalizedString;
}

export interface QuestionSentence {
  readonly pre: string;
  readonly verb: string;
  readonly post: string;
  readonly answer: TenseId;
  readonly distractors?: readonly SentenceDistractor[];
}

export interface Question {
  readonly id: string;
  readonly league?: League;
  readonly mechanism: TaskMechanism;
  readonly prompt: LocalizedString;
  readonly explanation?: LocalizedString;
  readonly rules?: LocalizedString;
  readonly contextExamples?: readonly string[];
  readonly sentences: readonly QuestionSentence[];
  readonly tags: readonly string[];
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
  readonly studyMode: boolean;
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
