import { inject, Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@shared/api/supabase.client';
import { StorageService } from '@shared/api/storage.service';
import type { Database } from '@shared/types/supabase.types';

export type AppRole = Database['public']['Enums']['app_role'];
export type League = Database['public']['Enums']['league'];
export type RankTier = Database['public']['Enums']['rank_tier'];

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly appRole: AppRole;
  readonly league: League;
  readonly rankTier: RankTier;
  readonly nickname: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly storage = inject(StorageService);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoading = signal(false);
  private firstLogin = false;

  constructor() {
    this.initSession();

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' && !this.firstLogin) {
          this.firstLogin = true;
          await this.storage.mergeLocalToCloud(session.user.id);
        }
        await this.loadUserProfile(session.user);
      } else {
        this.firstLogin = false;
        this.currentUser.set(null);
      }
    });
  }

  private async initSession(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data } = await this.supabase.auth.getSession();
      if (data.session?.user) {
        await this.loadUserProfile(data.session.user);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadUserProfile(user: User): Promise<void> {
    const { data } = await this.supabase
      .from('users')
      .select('role, league, rank_tier, nickname')
      .eq('id', user.id)
      .single();

    this.currentUser.set({
      id: user.id,
      email: user.email ?? '',
      appRole: data?.role ?? 'user',
      league: data?.league ?? 'elementary',
      rankTier: data?.rank_tier ?? 'iron',
      nickname: data?.nickname ?? null,
    });
  }

  async signInWithGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  getSession(): Promise<{ data: { session: Session | null } }> {
    return this.supabase.auth.getSession();
  }
}
