import type { TenseId } from '@shared/config/tenses.config';

export type QuestionType = 'sentence' | 'context';

export interface Question {
  id: string;
  tenseId: TenseId;
  type: QuestionType;
  prompt: string;
  difficulty: 1 | 2 | 3;
}

export type SessionMode = 'normal' | 'daily';

export interface SessionAnswer {
  questionId: string;
  tenseId: TenseId;
  isCorrect: boolean;
  responseMs: number;
}

export interface Session {
  id: string;
  mode: SessionMode;
  score: number;
  answers: SessionAnswer[];
  startedAt: number;
  completedAt: number;
}

export type ScoreDisplayPreference = 'ielts' | 'toefl' | 'cambridge' | 'none';

export interface UserProfile {
  id: string;
  hasSeenOnboarding: boolean;
  scoreDisplayPreference: ScoreDisplayPreference;
}
