import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '@shared/api/storage.service';
import { rankProgress } from '@shared/config/rank.config';
import type { ScoreDisplayPreference, UserProfile } from '@shared/types';

const DEFAULT_PROFILE: UserProfile = {
  id: 'local',
  nickname: 'Guest',
  rankTier: 'rookie',
  rankPoints: 0,
  streakDays: 0,
  isPremium: false,
  hasSeenOnboarding: false,
  scoreDisplayPreference: 'none',
  studyMode: false,
  pauseMode: false,
  avatarHue: 210,
};

/**
 * UserStore — local player profile and progression. Anonymous play persists to
 * StorageService; Phase 8 swaps in Supabase-backed sync behind the same surface.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly storage = inject(StorageService);

  private readonly _profile = signal<UserProfile>({
    ...DEFAULT_PROFILE,
    ...this.storage.load<Partial<UserProfile>>('user:profile', {}),
  });

  readonly profile = this._profile.asReadonly();
  readonly rank = computed(() => rankProgress(this._profile().rankPoints));
  readonly streakDays = computed(() => this._profile().streakDays);
  readonly studyMode = computed(() => this._profile().studyMode ?? false);
  readonly pauseMode = computed(() => this._profile().pauseMode ?? false);
  readonly scoreDisplayPreference = computed(
    () => this._profile().scoreDisplayPreference,
  );
  readonly avatarHue = computed(() => this._profile().avatarHue);

  awardRankPoints(points: number): void {
    this._profile.update((p) => ({ ...p, rankPoints: p.rankPoints + points }));
    this.persist();
  }

  setNickname(nickname: string): void {
    this._profile.update((p) => ({ ...p, nickname }));
    this.persist();
  }

  markOnboardingSeen(): void {
    this._profile.update((p) => ({ ...p, hasSeenOnboarding: true }));
    this.persist();
  }

  toggleStudyMode(): void {
    this._profile.update((p) => ({ ...p, studyMode: !p.studyMode }));
    this.persist();
  }

  togglePauseMode(): void {
    this._profile.update((p) => ({ ...p, pauseMode: !p.pauseMode }));
    this.persist();
  }

  setScoreDisplayPreference(pref: ScoreDisplayPreference): void {
    this._profile.update((p) => ({ ...p, scoreDisplayPreference: pref }));
    this.persist();
  }

  setAvatarHue(hue: number): void {
    this._profile.update((p) => ({ ...p, avatarHue: hue }));
    this.persist();
  }

  private persist(): void {
    this.storage.save('user:profile', this._profile());
  }
}
