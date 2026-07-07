import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '@shared/api/auth.service';

const ROLE_HIERARCHY = { user: 0, support: 1, moderator: 2, admin: 3 } as const;

// RLS is the source of truth — this guard is UX only.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.currentUser()?.appRole ?? 'user';
  if (ROLE_HIERARCHY[role] >= ROLE_HIERARCHY['support']) return true;
  return router.parseUrl('/home');
};
