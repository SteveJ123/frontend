import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Progress } from './components/progress/progress';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Notfound } from './components/notfound/notfound';
import { authGuard, guestGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'feed', component: Home, canActivate: [authGuard] },
  { path: 'progress', component: Progress, canActivate: [authGuard] },
  { path: '**', component: Notfound },
];
