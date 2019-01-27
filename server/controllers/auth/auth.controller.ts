import { UserRegisterRequest, UserRegisterResponse, User, UserChangePasswordRequest, UserChangePasswordResponse } from './../../models/user.model';
import UserDB from '../../models/schemas/users.schema';
import TokenDB from '../../models/schemas/token.schema';
import * as ResCode from '../../codes/response';

const env = process.env.NODE_ENV || 'development';
// logger = require('../../logger');

import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { Route, Post, Body, Get, Security, Query } from 'tsoa';
import { UserLoginRequest, UserLoginResponse } from '../../models/user.model';
import { Token } from '../../models/token';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';

@Route('')
export class AuthController {

  @Post('login')
  public async login(@Body() requestBody: UserLoginRequest): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse>((resolve, reject) => {

      UserDB.findOne({'email' : requestBody.email}, (error, user) => {

        if (error) {
          return reject(new UserLoginResponse(false, error));
        }

        // console.log(user);
        if (!user) {
          reject(new UserLoginResponse(false, 'User does not exist'));
          return;
        } else {
          if (!user.validPassword(requestBody.password)) {
            reject(new UserLoginResponse(false, 'Incorrect password'));
            return;
          }

          if (!process.env.secret || !process.env.expiry ) {
            reject(new UserLoginResponse(false, 'Something went wrong, please contact site administrator'));
            return;
          }

          user.salt = '';
          user.hash = '';
          const role = [];
          role.push(user.role);
          const token = jwt.sign({
            userID: user._id,
            email: user.email,
            name: user.name,
            scopes: role
          }, process.env.secret, {
            expiresIn : 60 * 60 * process.env.expiry
          });
          resolve(new UserLoginResponse(true, 
                                        'You are logged in.', 
                                        token, 
                                        { 
                                          name: user.name, 
                                          email: user.email,
                                          role: user.role,
                                          isVerified: user.isVerified,
                                          hasPasswordBeenSet: user.hasPasswordBeenSet
                                        }));
        }
      });
    });
  }

  @Post('register')
  public register(@Body() requestBody: UserRegisterRequest): Promise<UserRegisterResponse> {
    const user = new UserDB();
    // console.log('Register: ');
    // console.log(requestBody);
    user.name = requestBody.name;
    user.email = requestBody.email;

    user.setPassword(requestBody.password);
    const token = user.generateJwt();
    return new Promise<UserRegisterResponse> ((resolve, reject) => {
      user.save((err) => {
        // console.log('register');
        if (err) {
          // console.log(err);
          reject(new UserRegisterResponse(false, 'Email exists'));
        }
        // console.log(token);
        const decoded = jwt.verify(token, process.env.secret);
        resolve(new UserRegisterResponse(true, 'Successfully registered', token, user, decoded));
      });
    });
  }

  @Security('JWT')
  @Get('check-state')
  public checkState(): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve) => {
      resolve(new UserLoginResponse(true, 'You are authorized.'));
    });
  }

  @Security('JWT')
  @Post('change-password')
  public changePassword(@Body() requestBody: UserChangePasswordRequest): Promise<UserChangePasswordResponse> {
    return new Promise<UserChangePasswordResponse> ((resolve, reject) => {
      UserDB.findOne({'email' : requestBody.email}, (error, user) => {
        if (error) {
          return reject(new UserLoginResponse(false, error));
        }
        if (!user.validPassword(requestBody.oldPassword)) {
          reject(new UserLoginResponse(false, 'Incorrect password'));
        }
        else {
          user.setPassword(requestBody.password);

          user.save((err) => {

            // console.log(token);
            resolve(new UserChangePasswordResponse(true, 'Successfully changed password'));
          });
        }
      });
    });
  }

  @Get('check-tmp-state')
  public checkTmpState(@Query() token?: string): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve, reject) => {
      console.log('check temp state', token);
      TokenDB.findOne({ token: token }).then(
        (token: Token) => {
          console.log(token)
          if(token) { 
            return resolve(new GeneralResponse(true, 'You are temporarily authorized.', ResCode.GENEROR_SUCCESS));
          }
          return reject(new ErrorResponse(false, "No token provided", ResCode.TOKEN_IS_NOT_PROVIDED));
        }
      ).catch(err => {
        return reject(new ErrorResponse(false, "No token provided", ResCode.TOKEN_IS_NOT_PROVIDED));
      });
    });
  }
}
