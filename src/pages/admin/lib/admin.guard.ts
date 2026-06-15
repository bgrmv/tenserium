import type { CanActivateFn } from '@angular/router';

/**
 * Gate for the admin panel.
 *
 * TODO(phase-11): enforce a real check here once auth lands (Phase 8) — verify
 * the Supabase session carries an admin/moderator/support role. Server-side
 * Row-Level Security remains the source of truth; this guard is only UX.
 * Until then the prototype build leaves the panel open.
 */
export const adminGuard: CanActivateFn = () => true;
