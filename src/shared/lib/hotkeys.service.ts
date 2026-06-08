import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { hotkeyToTense } from '@shared/config/tenses.config';
import type { TenseId } from '@shared/config/tenses.config';

/**
 * Emits the {@link TenseId} for F1–F12 and the digit keys 1–9,0 (mobile/laptop
 * keyboards without F-row). Subscribe only while a game page is active.
 */
@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private readonly doc = inject(DOCUMENT);

  readonly tenseKey$: Observable<TenseId> = new Observable<KeyboardEvent>((sub) => {
    const handler = (e: KeyboardEvent) => sub.next(e);
    this.doc.addEventListener('keydown', handler);
    return () => this.doc.removeEventListener('keydown', handler);
  }).pipe(
    map((e) => this.keyToOrder(e)),
    filter((n): n is number => n !== null),
    map((n) => hotkeyToTense(n)),
    filter((t): t is NonNullable<typeof t> => t != null),
    map((t) => t.id),
  );

  private keyToOrder(e: KeyboardEvent): number | null {
    const fMatch = /^F(\d{1,2})$/.exec(e.key);
    if (fMatch) {
      const n = Number(fMatch[1]);
      if (n >= 1 && n <= 12) {
        e.preventDefault();
        return n;
      }
    }
    if (/^[1-9]$/.test(e.key)) return Number(e.key);
    if (e.key === '0') return 10;
    return null;
  }
}
