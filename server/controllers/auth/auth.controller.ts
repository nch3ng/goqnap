import { UserRegisterRequest, UserRegisterResponse, User } from './../../models/user.model';
import UserDB from '../../models/schemas/users.schema';
const env = process.env.NODE_ENV || 'development';
const config = require('../../config')[env];
// logger = require('../../logger');

import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { Route, Post, Body, Get, Security } from 'tsoa';
import { UserLoginRequest, UserLoginResponse } from '../../models/user.model';

@Route('')
export class AuthController {

  @Post('login')
  public async login(@Body() requestBody: UserLoginRequest): Promise<UserLoginResponse> {
    // console.log('Login a user: ');
    // // console.log(requestBody);
    return new Promise<UserLoginResponse>((resolve, reject) => {

      UserDB.findOne({'email' : requestBody.email}, (error, user) => {

        if (error) {
          return reject(new UserLoginResponse(false, error));
        }
        if (!user) {
          reject(new UserLoginResponse(false, 'User does not exists'));
        }

        if (!user.validPassword(requestBody.password)) {
          reject(new UserLoginResponse(false, 'Incorrect password'));
        }

        user.salt = '';
        user.hash = '';
        const token = jwt.sign({
          userID: user._id,
          email: user.email,
          name: user.name
        }, config.secret, {
          expiresIn : 60 * 60 * config.expiry
        });
        resolve(new UserLoginResponse(true, 'You are logged in.', token, <User>{ name: user.name, email: user.email}));
      });
    });
  }

  @Post('register')
  public async register(@Body() requestBody: UserRegisterRequest): Promise<UserRegisterResponse> {
    const user = new UserDB();
    console.log('Register: ');
    // console.log(requestBody);
    user.name = requestBody.name;
    user.email = requestBody.email;

    user.setPassword(requestBody.password);
    const token = user.generateJwt();
    return new Promise<UserRegisterResponse> ((resolve, reject) => {
      user.save((err) => {
        if (err) {
          reject(new UserRegisterResponse(false, err));
        }
        // console.log(token);
        const decoded = jwt.verify(token, config.secret);
        resolve(new UserRegisterResponse(true, 'Successfully registered', token, user, decoded));
      });
    });
  }

  @Security('api_key')
  @Get('check-state')
  public async checkState(): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve) => {
      resolve(new UserLoginResponse(true, 'You are authorized.'));
    });
  }
}
