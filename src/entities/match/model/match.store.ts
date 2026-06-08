import { Injectable, computed, signal } from '@angular/core';
import type { Player } from '@shared/types';

interface BotSpec {
  readonly id: string;
  readonly name: string;
  readonly avatarHue: number;
  readonly accuracy: number;
  readonly speed: number;
}

const BOT_SPECS: readonly BotSpec[] = [
  { id: 'bot-lexa',  name: 'Lexa',  avatarHue: 268, accuracy: 0.84, speed: 2.6 },
  { id: 'bot-verbo', name: 'Verbo', avatarHue: 150, accuracy: 0.76, speed: 3.1 },
  { id: 'bot-tenso', name: 'Tenso', avatarHue: 28,  accuracy: 0.69, speed: 3.8 },
];

interface BotState extends BotSpec {
  score: number;
  answered: number;
  elapsed: number;
}

/**
 * MatchStore — scripted-bot squad simulation. A stand-in for Supabase Realtime
 * (Phase 10). Drive it with {@link tick} on an interval while a squad match is
 * live; read {@link leaderboard} for the live standings.
 */
@Injectable({ providedIn: 'root' })
export class MatchStore {
  private readonly _bots = signal<readonly BotState[]>([]);
  private readonly _total = signal(0);
  private readonly _playerScore = signal(0);
  private readonly _playerAnswered = signal(0);
  private readonly _playerName = signal('You');
  private readonly _playerHue = signal(210);

  readonly leaderboard = computed<readonly Player[]>(() => {
    const you: Player = {
      id: 'you',
      name: this._playerName(),
      isBot: false,
      avatarHue: this._playerHue(),
      score: this._playerScore(),
      answered: this._playerAnswered(),
    };
    const bots: Player[] = this._bots().map((b) => ({
      id: b.id,
      name: b.name,
      isBot: true,
      avatarHue: b.avatarHue,
      score: b.score,
      answered: b.answered,
    }));
    return [you, ...bots].sort((a, b) => b.score - a.score);
  });

  readonly playerPlace = computed(
    () => this.leaderboard().findIndex((p) => p.id === 'you') + 1,
  );

  start(total: number, playerName = 'You', playerHue = 210): void {
    this._total.set(total);
    this._playerScore.set(0);
    this._playerAnswered.set(0);
    this._playerName.set(playerName);
    this._playerHue.set(playerHue);
    this._bots.set(BOT_SPECS.map((b) => ({ ...b, score: 0, answered: 0, elapsed: 0 })));
  }

  syncPlayer(score: number, answered: number): void {
    this._playerScore.set(score);
    this._playerAnswered.set(answered);
  }

  tick(dtSeconds: number): void {
    const total = this._total();
    this._bots.update((bots) =>
      bots.map((b) => {
        if (b.answered >= total) return b;
        const elapsed = b.elapsed + dtSeconds;
        const target = b.speed + (Math.random() - 0.5);
        if (elapsed >= target) {
          const correct = Math.random() < b.accuracy;
          return {
            ...b,
            elapsed: 0,
            answered: b.answered + 1,
            score: b.score + (correct ? 80 + Math.floor(Math.random() * 90) : 0),
          };
        }
        return { ...b, elapsed };
      }),
    );
  }
}
