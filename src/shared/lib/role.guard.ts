import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@shared/api/auth.service';
import type { AppRole } from '@shared/api/auth.service';

const ROLE_HIERARCHY: Record<AppRole, number> = {
  user: 0,
  support: 1,
  moderator: 2,
  admin: 3,
};

export const roleGuard = (minRole: AppRole): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const userRole = auth.currentUser()?.appRole ?? 'user';
    if (ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]) return true;
    return router.parseUrl('/home');
  };
};
