import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '@entities/user';
import { DailyStore } from '@entities/daily';
import { StorageService } from '@shared/api/storage.service';
import { rankTier } from '@shared/config/rank.config';
import {
  ASPECT_LABEL,
  ASPECT_ORDER,
  TENSES,
} from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { PaletteMode } from '@shared/config/tense-colors';
import { getEquivalent, getSubDivLabel } from '@shared/lib/cefr';
import type { CefrLevel, SubDivision } from '@shared/config/cefr.config';
import type { Aspect, ScoreDisplayPreference, SessionMode } from '@shared/types';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { ProgressBarComponent } from '@shared/ui/progress-bar/progress-bar.component';
import { RankShieldComponent } from '@shared/ui/rank-shield/rank-shield.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** Placeholder accuracy until real session-history tracking lands (see plan §B). */
const ACCURACY_BY_ASPECT: Record<Aspect, number> = {
  simple: 0.96,
  continuous: 0.9,
  perfect: 0.82,
  'perfect-continuous': 0.71,
};

/** Placeholder CEFR position — no division is persisted on the profile yet. */
const PLACEHOLDER_LEVEL: CefrLevel = 'B1';
const PLACEHOLDER_SUBDIV: SubDivision = 3;

interface LastSession {
  readonly mode: SessionMode;
  readonly score: number;
  readonly accuracy: number;
  readonly bestStreak: number;
  readonly at: number;
}

const AVATAR_HUES = [210, 162, 305, 52, 28, 255, 130] as const;

const DISPLAY_OPTIONS: readonly {
  value: ScoreDisplayPreference;
  label: string;
}[] = [
  { value: 'none', label: 'None' },
  { value: 'ielts', label: 'IELTS' },
  { value: 'toefl', label: 'TOEFL' },
  { value: 'cambridge', label: 'Cambridge' },
];

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent,
    ProgressBarComponent,
    RankShieldComponent,
    IconComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePageComponent {
  private readonly user = inject(UserStore);
  private readonly daily = inject(DailyStore);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  protected readonly profile = this.user.profile;
  protected readonly rank = this.user.rank;
  protected readonly dailyStreak = this.daily.streak;

  protected readonly palette = signal<PaletteMode>('aspect');
  protected readonly editingNickname = signal(false);
  protected readonly confirmDelete = signal(false);

  protected readonly avatarHues = AVATAR_HUES;
  protected readonly displayOptions = DISPLAY_OPTIONS;
  protected readonly aspectLabel = ASPECT_LABEL;

  protected readonly tierMetal = computed(
    () => rankTier(this.rank().tier).metal,
  );

  protected readonly division = computed(() =>
    getSubDivLabel(PLACEHOLDER_LEVEL, PLACEHOLDER_SUBDIV),
  );

  protected readonly equivalent = computed(() =>
    getEquivalent(PLACEHOLDER_LEVEL, this.profile().scoreDisplayPreference),
  );

  protected readonly lastSession = computed(() =>
    this.storage.load<LastSession | null>('session:last', null),
  );

  protected readonly aspectRows = computed(() =>
    ASPECT_ORDER.map((aspect) => {
      const repr = TENSES.find(
        (t) => t.aspect === aspect && t.time === 'present',
      )!;
      return {
        aspect,
        label: ASPECT_LABEL[aspect],
        color: tenseColor(repr, this.palette()),
        accuracy: ACCURACY_BY_ASPECT[aspect],
      };
    }),
  );

  protected readonly hotkeyRows = computed(() =>
    TENSES.map((t) => ({
      id: t.id,
      name: t.name,
      hotkey: t.hotkey,
      color: tenseColor(t, this.palette()),
    })),
  );

  protected setNickname(value: string): void {
    const trimmed = value.trim();
    if (trimmed) this.user.setNickname(trimmed);
    this.editingNickname.set(false);
  }

  protected setAvatarHue(hue: number): void {
    this.user.setAvatarHue(hue);
  }

  protected setDisplayPreference(pref: ScoreDisplayPreference): void {
    this.user.setScoreDisplayPreference(pref);
  }

  protected toggleStudyMode(): void {
    this.user.toggleStudyMode();
  }

  protected togglePauseMode(): void {
    this.user.togglePauseMode();
  }

  protected train(): void {
    void this.router.navigate(['/game'], { queryParams: { mode: 'rank' } });
  }

  protected sessionDate(at: number): string {
    return new Date(at).toLocaleDateString();
  }
}
