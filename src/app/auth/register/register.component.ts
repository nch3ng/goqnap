import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { User } from '../../model/user';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  
  user: User;
  message: string = '';

  constructor(private authService: AuthService, private router: Router) { 
    this.user = new User();
  }

  ngOnInit() {
  }

  register(user: User){
    console.log("register: ");

    this.authService.registerUser(user).subscribe( (res) => {
      console.log(res);
      if( res['success'] == true ) {
        this.authService.setUser(res['user']);
        this.router.navigate(['/profile']);
      } else {
        this.message = res['message'];
      }
    })
    // var body = JSON.stringify({
    //   name: this.user.name,
    //   email: this.user.email,
    //   password: this.user.password
    // });

    // return this.http.post('/api/register', body, {headers:this.headers}).map((response: Response) => {
    //     // login successful if there's a jwt token in the response
    //     let user = response.json();
    //     console.log(user);
    //     return user;
    // }).subscribe();
  }

}
