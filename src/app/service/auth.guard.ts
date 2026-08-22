// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './AuthService';

// Redirects to /login if user is NOT logged in
// export const authGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isLoggedIn()) {
//     return true;
//   }

//   return router.createUrlTree(['/login']);
// };

// // Redirects to /feed if user IS ALREADY logged in
// export const guestGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // If user is logged in, block access to login/register and redirect to /feed
//   if (authService.isLoggedIn()) {
//     return router.createUrlTree(['/feed']);
//   }

//   return true;
// };

// Auth Guard with Role-Based Routing
// export const authGuard: CanActivateFn = (route) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (!authService.isLoggedIn()) {
//     return router.createUrlTree(['/login']);
//   }
//   // const role = 'admin';

//   const role = authService.getUserRole(); // Returns 'admin' or 'user'
//   const path = route.routeConfig?.path;

//   // Restrict Admin: Redirect from user-feed to feed
//   if (role === 'admin' && path === 'user-feed') {
//     return router.createUrlTree(['/feed']);
//   }

//   // Restrict Normal User: Redirect from feed to user-feed
//   if (role === 'user' && path === 'feed') {
//     return router.createUrlTree(['/user-feed']);
//   }

//   return true;
// };

// export const guestGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const role = 'admin';

//   if (authService.isLoggedIn()) {
//     // const role = authService.getUserRole();
//     return router.createUrlTree([role === 'admin' ? '/feed' : '/user-feed']);
//   }

//   return true;
// };

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
  if (role === 'admin' && path === 'user-feed') {
    return router.createUrlTree(['/feed']);
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
    return router.createUrlTree([role === 'admin' ? '/feed' : '/user-feed']);
  }

  return true;
};
