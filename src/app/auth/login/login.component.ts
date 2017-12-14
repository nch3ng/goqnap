import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../model/user';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  user: User;
  message: string = '';
  user_status: boolean;
  error: boolean = false;

  constructor(private authService: AuthService, private router: Router) { 
    this.user = new User();
  }

  ngOnInit() {
  }

  login(user: User){
    this.authService.loginUser(user).subscribe( res => {
      this.user_status = res['success']; 
      if(res['success'] == true) {
        this.error=false;
        this.authService.setUser(res['user']);
        this.router.navigate(['/profile']);
      } else {
        this.error=true;
        this.message = res['message'];
      }
    });;
  }

}
