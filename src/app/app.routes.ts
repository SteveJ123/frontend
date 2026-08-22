import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Progress } from './components/progress/progress';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Notfound } from './components/notfound/notfound';
import { authGuard, guestGuard } from './service/auth.guard';
import { CreateUserPost } from './components/create-user-post/create-user-post';
import { CreateAdminPost } from './components/create-admin-post/create-admin-post';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'feed', component: CreateAdminPost, canActivate: [authGuard] },
  { path: 'user-feed', component: CreateUserPost, canActivate: [authGuard] },
  { path: 'progress', component: Progress, canActivate: [authGuard] },
  { path: '**', component: Notfound },
];
