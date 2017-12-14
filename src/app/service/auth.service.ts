import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { User } from "../model/user";
import { Observable } from "rxjs/Observable";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { JwtHelper } from 'angular2-jwt';


@Injectable()
export class AuthService {
  private base_url = '/api';
  token: string;
  private userSource = new Subject<User>();
  user$ = this.userSource.asObservable();
  constructor(public http: Http, private jwtHelper: JwtHelper) { 
    this.jwtHelper =  new JwtHelper();
  }
    
  constructHeader(){
    let currUser = JSON.parse(localStorage.getItem('currentUser')); 
    let token = ( currUser && 'token' in currUser) ? currUser.token : this.token;
    let headers = new Headers({ 'x-access-token': token });
    return new RequestOptions({ headers: headers });
  }
  setUser(user: User) {
    this.userSource.next(user);
  }
  
  registerUser(user: User): Observable<boolean> {
    console.log("Register: " + user);
    let body = JSON.stringify(user);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${this.base_url}/register`, body, options).map( (res) => this.setToken(res) );
  }

  loginUser(user): Observable<Object> {
    let body = JSON.stringify(user);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });

    return this.http.post(`${this.base_url}/login`, body, options).map( (res) => this.setToken(res) );
  }


  logout() {
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  verify(): Observable<Object> {
    console.log("verify");
    /*let currUser = JSON.parse(localStorage.getItem('currentUser')); 
    let token = ( currUser && 'token' in currUser) ? currUser.token : this.token;
    let headers = new Headers({ 'x-access-token': token });
    let options = new RequestOptions({ headers: headers });*/
    var options = this.constructHeader();
    return this.http.get(`${this.base_url}/check-state`, options).map( res => this.parseRes(res) );
    
  }

  isAuthenticated(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var token = null;

    if (currentUser) {
      token = currentUser.token;
    }
    if(token===null){
      return false;
    // Check whether the token is expired and return
    // true or false
    } else
      return !this.jwtHelper.isTokenExpired(token);
  }
    

  setToken(res){
    // console.log('set token');
    // console.log(res);
    // console.log("==========");
    let body = JSON.parse(res['_body']);
    if( body['success'] == true ){
      this.token = body['token'];
      localStorage.setItem('currentUser', JSON.stringify({ 
        email: body['user']['email'], 
        token: this.token 
      }));
    }
    return body;
  }

  parseRes(res){
    let body = JSON.parse(res['_body']);
    return body;
  }
}