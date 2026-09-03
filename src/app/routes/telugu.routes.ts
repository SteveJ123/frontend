import { Routes } from '@angular/router';

import { Notfound } from '.././components/telugu/notfound/notfound';
// import { Notfound } from './components/notfound/notfound';
// import { guestGuard, roleGuard } from './service/auth.guard';
import { guestGuard, roleGuard } from '.././service/auth.guard';
import { CreateUserPost } from '.././components/telugu/create-user-post/create-user-post';
import { CreateAdminPost } from '.././components/telugu/create-admin-post/create-admin-post';
import { RajaYogaAdminPost } from '.././components/telugu/raja-yoga-admin-post/raja-yoga-admin-post';
import { Team } from '.././components/telugu/team/team';
import { SupportTeam } from '.././components/telugu/support-team/support-team';
import { UserProfile } from '.././components/telugu/user-profile/user-profile';
import { EditProfile } from '.././components/telugu/edit-profile/edit-profile';
import { CourseList } from '.././components/telugu/course-list/course-list';
import { PersonalInfo } from '.././components/telugu/personal-info/personal-info';
import { CourseDetails } from '.././components/telugu/course-details/course-details';
import { Session } from '.././components/telugu/session/session';
import { Shop } from '.././components/telugu/shop/shop';
import { DailyTracker } from '.././components/telugu/daily-tracker/daily-tracker';

export const TELUGU_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'community-post',
    component: CreateAdminPost,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  // {
  //   path: 'face-raj-yoga',
  //   component: RajaYogaAdminPost,
  //   canMatch: [roleGuard],
  //   data: { roles: ['admin', 'user'] },
  // },
  { path: 'team', component: Team, canMatch: [roleGuard], data: { roles: ['admin'] } },
  {
    path: 'support-team',
    component: SupportTeam,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'user-feed',
    component: CreateUserPost,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'user-profile',
    component: UserProfile,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'edit-profile',
    component: EditProfile,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  // {
  //   path: 'create-course',
  //   component: CreateCourse,
  //   canMatch: [roleGuard],
  //   data: { roles: ['admin'] },
  // },
  {
    path: 'courses-list',
    component: CourseList,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'courses/:id',
    component: CourseDetails,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'session',
    component: Session,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'shop',
    component: Shop,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'daily-tracker',
    component: DailyTracker,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  {
    path: 'personal-info',
    component: PersonalInfo,
    canMatch: [roleGuard],
    data: { roles: ['admin', 'user'] },
  },
  // { path: 'progress', component: Progress },
  { path: '**', component: Notfound },
];
