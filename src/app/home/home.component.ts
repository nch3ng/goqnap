import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../model/user';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: User;
  message: String;
  subscription: Subscription;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    if(!this.authService.isAuthenticated()) 
      this.router.navigate(['']);
    else
      this.router.navigate(['/dashboard']);
  }

  isSignedIn(){
    return !this.authService.isAuthenticated();
  }

  logout() {
    console.log("logout");
    this.authService.logout();
    this.user = null;
    this.message = "Logged out";
    this.router.navigate(['/']);
  }

}
