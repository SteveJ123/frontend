// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from './AuthService';

export const roleGuard: CanMatchFn | CanActivateFn = (route: any, segments: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check Authentication Status
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // 2. Extract allowed roles defined on the route
  const allowedRoles = route.data?.['roles'] as Array<string>;
  const currentUserRole = authService.getUserRole();

  // 3. Verify user has the required role
  if (allowedRoles && allowedRoles.includes(currentUserRole)) {
    return true;
  }

  // 4. Redirect unauthorized users based on role
  if (currentUserRole === 'admin') {
    return router.createUrlTree(['/admin-dashboard']);
    // return router.createUrlTree(['/te/community-post']);
  }

  return router.createUrlTree(['/user-feed']);
};

// Restricts protected routes based on login status and role
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Redirect unauthenticated users to /login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const role = authService.getUserRole();
  const path = route.routeConfig?.path;

  // 2. Prevent admins from accessing user-feed (redirect to /feed)
  if (role === 'admin' && path === 'face-yoga') {
    return router.createUrlTree(['/face-yoga']);
  }

  // 3. Prevent standard users from accessing admin feed (redirect to /user-feed)
  if (role === 'user' && path === 'feed') {
    return router.createUrlTree(['/user-feed']);
  }

  return true;
};

// Prevents authenticated users from viewing login/register
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.getUserRole();
    return router.createUrlTree([role === 'admin' ? '/face-yoga' : '/user-feed']);
  }

  return true;
};
