import UserDB from '../../models/schemas/users';
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
  login(@Body() requestBody: UserLoginRequest): Promise<UserLoginResponse> {
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

        const token = jwt.sign({
          userID: user._id,
          email: user.email,
          name: user.name
        }, config.secret, {
          expiresIn : 60 * 60 * config.expiry
        });
        resolve(new UserLoginResponse(true, 'You are logged in.', token, user));
      });
    });
  }

  @Security('jwt')
  @Get('check-state')
  checkState(): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve) => {
      resolve(new UserLoginResponse(true, 'You are authorized.'));
    });
  }
}
