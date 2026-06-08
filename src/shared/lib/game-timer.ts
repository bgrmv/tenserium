import { computed, signal, type Signal } from '@angular/core';

export interface GameTimer {
  readonly remainingMs: Signal<number>;
  readonly fraction: Signal<number>;
  readonly expired: Signal<boolean>;
  start(): void;
  stop(): void;
  reset(): void;
}

/**
 * rAF-driven countdown over `windowMs`. Zoneless-friendly: it only writes
 * signals, so change detection reacts without zone.js. `onExpire` fires once
 * per run when the clock hits zero.
 */
export function createGameTimer(windowMs: number, onExpire?: () => void): GameTimer {
  const remainingMs = signal(windowMs);
  const fraction = computed(() => remainingMs() / windowMs);
  const expired = computed(() => remainingMs() <= 0);

  let rafId = 0;
  let startedAt = 0;
  let fired = false;

  const tick = (now: number) => {
    const left = Math.max(0, windowMs - (now - startedAt));
    remainingMs.set(left);
    if (left <= 0) {
      if (!fired) {
        fired = true;
        onExpire?.();
      }
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  return {
    remainingMs: remainingMs.asReadonly(),
    fraction,
    expired,
    start() {
      cancelAnimationFrame(rafId);
      fired = false;
      startedAt = performance.now();
      remainingMs.set(windowMs);
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(rafId);
    },
    reset() {
      cancelAnimationFrame(rafId);
      fired = false;
      remainingMs.set(windowMs);
    },
  };
}
