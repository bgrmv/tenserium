import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase.client';

/**
 * Single seam over persistence.
 * Guests: localStorage (sync).
 * Authenticated users: localStorage as write-through cache + background Supabase sync.
 * On first login: mergeLocalToCloud() migrates existing localStorage data.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'tenserium:';
  private readonly supabase = inject(SUPABASE_CLIENT);

  // ─── Sync interface (used by all stores — unchanged) ─────────────────────────

  load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      /* quota or unavailable */
    }
    this.syncKeyToCloud(key, value);
  }

  clear(key: string): void {
    localStorage.removeItem(this.prefix + key);
    this.clearKeyFromCloud(key);
  }

  // ─── Cloud sync (async, fire-and-forget) ──────────────────────────────────────

  private async syncKeyToCloud<T>(key: string, value: T): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    await this.supabase.from('user_data').upsert(
      { user_id: userId, key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' },
    );
  }

  private async clearKeyFromCloud(key: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    await this.supabase.from('user_data').delete().eq('user_id', userId).eq('key', key);
  }

  // ─── Called by AuthService on first login ─────────────────────────────────────

  async mergeLocalToCloud(userId: string): Promise<void> {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    if (keys.length === 0) return;

    const rows = keys.map(fullKey => ({
      user_id: userId,
      key: fullKey.replace(this.prefix, ''),
      value: localStorage.getItem(fullKey) ?? 'null',
    }));

    await this.supabase.from('user_data').upsert(rows, { onConflict: 'user_id,key' });
  }

  async loadFromCloud(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', userId);

    if (!data) return;

    for (const row of data) {
      localStorage.setItem(this.prefix + row.key, row.value as string);
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.user.id ?? null;
  }
}
