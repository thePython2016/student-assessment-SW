import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard = (allowed: string[]): CanActivateFn => () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('loginToken');
  const role = sessionStorage.getItem('role');

  if (!token) return router.createUrlTree(['/login']);
  if (role && allowed.includes(role)) return true;
  return router.createUrlTree(['/login']);
};