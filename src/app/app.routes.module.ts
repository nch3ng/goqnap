
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';

import { Routes, RouterModule  } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { AuthGuardService as AuthGuard } from './service/auth.guard.service';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

export const AppRouting = RouterModule.forRoot(routes, { 
  useHash: true,
  enableTracing: false
});