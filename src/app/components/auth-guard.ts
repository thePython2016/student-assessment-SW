import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Access token present and not expired — allow access
  if (authService.isTokenValid()) {
    return true;
  }

  // No token, or invalid/expired — clear storage WITHOUT navigating here,
  // then return a UrlTree so the router itself performs the redirect.
  // (Calling router.navigate() from inside a guard while a navigation
  // is still resolving can cause the router to stall instead of redirecting.)
  authService.clearSession();
  return router.createUrlTree(['']);
};