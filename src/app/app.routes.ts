import { Routes, RouterModule  } from '@angular/router';

import { HomeComponent } from './home/home.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './home/profile/profile.component';

import { AuthGuardService as AuthGuard } from './service/auth.guard.service';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { UsersComponent } from './home/users/users.component';
import { UserComponent } from './home/user/user.component';
import { MediaComponent } from './home/media/media.component';
import { EventsComponent } from './home/events/events.component';

const routes: Routes = [
  { path: '', component: HomeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent},
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
      { path: 'media', component: MediaComponent, canActivate: [AuthGuard]},
      { path: 'events', component: EventsComponent, canActivate: [AuthGuard]},
      { path: 'users', canActivate: [AuthGuard],
        children: [
          { path: '', component: UsersComponent},
          { path: ':id', component: UserComponent}
        ]},
    ]
  },
  /*{ path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard], outlet: "home"},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] , outlet: "home"},*/
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent}
];

export const AppRouting = RouterModule.forRoot(routes, {
  useHash: true,
  enableTracing: true
});
