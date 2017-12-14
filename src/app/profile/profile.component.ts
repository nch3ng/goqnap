import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { User } from '../model/user';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  user: User;
  message: String;
  subscription: Subscription;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    console.log(this.user);
    //example of verification
    this.authService.verify().subscribe( (res) => this.message = res['message']);
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.message = "Logged out";
    this.router.navigate(['/']);
  }

}
