import { Routes } from '@angular/router';

import { Notfound } from '.././components/english/notfound/notfound';
// import { Notfound } from './components/notfound/notfound';
// import { guestGuard, roleGuard } from './service/auth.guard';
import { guestGuard, roleGuard } from '.././service/auth.guard';
import { CreateUserPost } from '.././components/english/create-user-post/create-user-post';
import { CreateAdminPost } from '.././components/english/create-admin-post/create-admin-post';
import { RajaYogaAdminPost } from '.././components/english/raja-yoga-admin-post/raja-yoga-admin-post';
import { Team } from '.././components/english/team/team';
import { SupportTeam } from '.././components/english/support-team/support-team';
import { UserProfile } from '.././components/english/user-profile/user-profile';
import { EditProfile } from '.././components/english/edit-profile/edit-profile';
import { CourseList } from '.././components/english/course-list/course-list';
import { PersonalInfo } from '.././components/english/personal-info/personal-info';
import { CourseDetails } from '.././components/english/course-details/course-details';
import { Session } from '.././components/english/session/session';
import { Shop } from '.././components/english/shop/shop';
import { DailyTracker } from '.././components/english/daily-tracker/daily-tracker';
import { AdminTrackerList } from '../components/english/admin-tracker-list/admin-tracker-list';

export const ENGLISH_ROUTES: Routes = [
  { path: '', redirectTo: 'community-post', pathMatch: 'full' },
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
    path: 'daily-tracker/:id',
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
  {
    path: 'admin-user-tracker',
    component: AdminTrackerList,
    canMatch: [roleGuard],
    data: { roles: ['admin'] },
  },
  // { path: 'progress', component: Progress },
  { path: '**', component: Notfound },
];
