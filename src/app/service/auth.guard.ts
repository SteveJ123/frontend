import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from './AuthService';

export const roleGuard: CanMatchFn | CanActivateFn = (route: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Redirect unauthenticated users to login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const currentUserRole = authService.getUserRole();

  // 2. ADMIN BYPASS: Admins have unrestricted access to all routes & languages
  if (currentUserRole === 'admin') {
    return true;
  }

  // --- STANDARD USER CHECKS BELOW ---

  // 3. Resolve user's allowed language ('en' or 'te')
  const userLang = (authService.getUserLanguage() || '').toLowerCase().trim();
  const allowedLang = userLang === 'telugu' || userLang === 'te' ? 'te' : 'en';

  // 4. Extract target language segment from navigation URL
  const currentUrl = router.getCurrentNavigation()?.extractedUrl.toString() || router.url;
  const targetLangSegment = currentUrl.split('/')[1]; // Extracts 'en' or 'te'

  // 5. Restrict standard users to their assigned language module
  if (targetLangSegment && (targetLangSegment === 'en' || targetLangSegment === 'te')) {
    if (targetLangSegment !== allowedLang) {
      return router.createUrlTree(['/', allowedLang, 'community-post']);
    }
  }

  // 6. Verify role permissions if specified in route data
  const allowedRoles = (route.data?.['roles'] as Array<string>) || [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUserRole)) {
    return router.createUrlTree(['/', allowedLang, 'community-post']);
  }

  return true;
};

// Prevents authenticated users from viewing login/register
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.getUserRole();

    // Admin goes directly to Admin Management Dashboard
    if (role === 'admin') {
      return router.createUrlTree(['/admin']);
    }

    // Standard User redirects to localized feed
    const rawLang = (authService.getUserLanguage() || '').toLowerCase().trim();
    const lang = rawLang === 'telugu' || rawLang === 'te' ? 'te' : 'en';

    return router.createUrlTree([`/${lang}/user-feed`]);
  }

  return true;
};
