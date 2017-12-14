import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';

import { Routes, RouterModule  } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { FormsModule } from '@angular/forms';
import { AuthService } from './service/auth.service';
import { AuthGuardService as AuthGuard } from './service/auth.guard.service';
import { JwtHelper } from 'angular2-jwt';

import { CustomFormsModule } from 'ng2-validation'


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      routes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    HttpModule,
    FormsModule,
    CustomFormsModule
  ],
  providers: [AuthService, AuthGuard, JwtHelper],
  bootstrap: [AppComponent]
})
export class AppModule { }
