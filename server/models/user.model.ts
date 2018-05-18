export class UserModel {
  email: string;
  password: string;
}

export class UserCreationRequest {
  email: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface IUserLoginResponse {
  success: boolean;
  message: string;
}

export class AuthResponseError {
  success: boolean;
  message: string;
  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

export class UserLoginResponse implements IUserLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserModel;
  decoded?: object;
  constructor(success: boolean, message: string, token?: string, user?: UserModel, decoded?: object) {
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
