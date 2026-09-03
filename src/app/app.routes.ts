import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Notfound } from './components/notfound/notfound';
import { guestGuard, roleGuard } from './service/auth.guard';
import { MainLayoutComponent } from './main-layout.component';
import { Admin } from './components/admin/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public Routes (No Header/Sidebar)
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'admin', component: Admin, canActivate: [roleGuard], data: { roles: ['admin'] } },

  // Authenticated Shell (Wraps Header + Sidebar for all module routes)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'en',
        canMatch: [roleGuard],
        loadChildren: () => import('./routes/english.routes').then((m) => m.ENGLISH_ROUTES),
      },
      {
        path: 'te',
        canMatch: [roleGuard],
        loadChildren: () => import('./routes/telugu.routes').then((m) => m.TELUGU_ROUTES),
      },
    ],
  },

  { path: '**', component: Notfound },
];
