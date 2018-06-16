import { UserCreationRequest, IUserLoginResponse } from './user.model';
export class User {
  _id: string;
  email: string;
  password: string;
  salt: string;
  hash: string;
  name: string;
  createdAt: Date;
  lastLoginAt: Date;


  isPasswordCreated(): boolean {
    if (this.salt && this.hash) {
      return true;
    }

    return false;
  }
}


export interface UserCreationRequest {
  email: string;
}



export class UserLoginRequest implements UserCreationRequest {
  email: string;
  password: string;
}


export class UserChangePasswordRequest extends UserLoginRequest {
  oldPassword: string;
}
export interface IUserLoginResponse {
  success: boolean;
  message: string;
}

export class UserCreationResponse implements IUserLoginResponse {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

export class UserRegisterRequest implements UserCreationRequest {
  email: string;
  password: string;
  name: string;
}
export class AuthResponseError {
  success: boolean;
  message: string;
  jwt_message?: JWTMessage;
  constructor(success: boolean, message: string, jwt_message?: JWTMessage) {
    this.success = success;
    this.message = message;
    if (jwt_message) {
      this.jwt_message = jwt_message;
    }
  }
}

export class JWTMessage {
  name: string;
  message: string;
  expiredAt: Date;
}

export interface Decoded {
  _id?: string;
  email?: string;
  name?: string;
  exp?: number;
}

export class UserLoginResponse implements IUserLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  decoded?: Decoded;

  constructor(success: boolean, message: string, token?: string, user?: User, decoded?: Decoded) {
    this.success = success;
    this.message = message;
    if (token) {
      this.token = token;
    }

    if (user) {
      this.user = user;
    }
  }
}

export class UserRegisterResponse extends UserLoginResponse {
}
export class UserChangePasswordResponse extends UserLoginResponse {
}
