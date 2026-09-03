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

  // 2. Resolve expected language code ('en' or 'te') from user profile
  const userLang = (authService.getUserLanguage() || '').toLowerCase().trim();
  const allowedLang = userLang === 'telugu' ? 'te' : 'en';

  // 3. Extract the target language segment from the current navigation URL
  const currentUrl = router.getCurrentNavigation()?.extractedUrl.toString() || router.url;
  const targetLangSegment = currentUrl.split('/')[1]; // Extracts 'en' or 'te'

  // 4. Block access if user tries to navigate to a different language module
  if (targetLangSegment && (targetLangSegment === 'en' || targetLangSegment === 'te')) {
    if (targetLangSegment !== allowedLang) {
      // Redirect cross-language attempts to the user's assigned language area
      return router.createUrlTree(['/', allowedLang, 'community-post']);
    }
  }

  // 5. Verify user role permissions
  const currentUserRole = authService.getUserRole();
  const allowedRoles = (route.data?.['roles'] as Array<string>) || [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUserRole)) {
    return redirectToDefault(allowedLang, router);
  }

  return true;
};

// Helper function to handle default redirects based on normalized language
function redirectToDefault(allowedLang: string, router: Router) {
  return router.createUrlTree(['/', allowedLang, 'community-post']);
}

// export const roleGuard: CanMatchFn | CanActivateFn = (route: any) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 1. Unauthenticated users redirect to /login
//   if (!authService.isLoggedIn()) {
//     return router.createUrlTree(['/login']);
//   }

//   const currentUserRole = authService.getUserRole();
//   const allowedRoles = (route.data?.['roles'] as Array<string>) || [];

//   // 2. Check if user role is permitted for the route
//   if (!allowedRoles.includes(currentUserRole)) {
//     return redirectToDefault(currentUserRole, authService, router);
//   }

// 3. Admin has unrestricted access to all routes
//   if (currentUserRole === 'admin') {
//     return true;
//   }

//   return true;
// };

// Helper function to handle default redirects based on role & course
// function redirectToDefault(role: string, authService: AuthService, router: Router) {
// if (role === 'user') {
// const currentUserLanguage = authService.getUserLanguage();
// const module = currentUserLanguage === 'English' ? 'en' : 'te';
// console.log('module', module);
// return router.createUrlTree([`${module}/community-post`]);
// }

// const courseType = (authService.getUserCourse() || '').toLowerCase().trim();
// const targetRoute = courseType === 'face yoga' ? '/face-yoga' : '/face-raj-yoga';

// return router.createUrlTree([targetRoute]);
// }

// Prevents authenticated users from viewing login/register
export const guestGuard: CanActivateFn = () => {
  // return true;
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // 1. Get and normalize the user's language preference
    console.log('rawLang', authService.getUserLanguage());
    const rawLang = authService.getUserLanguage() || 'English';
    const lang = rawLang.toLowerCase().trim() === 'Telugu' ? 'te' : 'en';

    const role = authService.getUserRole();
    if (role === 'admin') {
      // Redirect to localized admin route (e.g., '/te/community-post' or '/en/community-post')
      // return router.createUrlTree([`/${lang}/community-post`]);
      return router.createUrlTree([`/admin`]);
    }

    const courseType = (authService.getUserCourse() || '').toLowerCase().trim();
    const defaultRoute = 'user-feed';

    // Redirect to localized user route (e.g., '/te/face-yoga' or '/en/face-yoga')
    return router.createUrlTree([`/${lang}/${defaultRoute}`]);
  }

  return true;
};
