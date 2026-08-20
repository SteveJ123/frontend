// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './AuthService';

// Redirects to /login if user is NOT logged in
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Redirects to /feed if user IS ALREADY logged in
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is logged in, block access to login/register and redirect to /feed
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/feed']);
  }

  return true;
};
