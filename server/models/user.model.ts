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
