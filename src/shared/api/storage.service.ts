import { Injectable } from '@angular/core';

/**
 * Single seam over persistence. Today: localStorage. Phase 8 swaps the body
 * for Supabase with no change to callers — nothing else in the app touches
 * `localStorage` directly.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'tenserium:';

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
      /* quota or unavailable — non-fatal for a browser-first app */
    }
  }

  clear(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}
