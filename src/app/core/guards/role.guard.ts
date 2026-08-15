import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard générique par permission — conforme à RM10 (les permissions dépendent
 * du rôle, pas de rôles codés en dur dans le frontend).
 * Usage dans les routes : canActivate: [permissionGuard('employe.gerer')]
 */
export function roleGuard(code: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    if (!auth.hasPermission(code)) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  };
}
