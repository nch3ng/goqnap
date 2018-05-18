import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { UserLoginResponse, AuthResponseError } from '../../../models/user.model';
const env = process.env.NODE_ENV || 'development';
const config = require('../../../config')[env];

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  console.log('auth middle');
  if (securityName === 'jwt') {
    const token = request.body.token || request.query.token || request.headers['x-access-token'];
    console.log(token);
    return new Promise((resolve, reject) => {
      // console.log('promise');

      if (!token) {
          reject(new AuthResponseError(false, 'No token provided'));
      }
      jwt.verify(token, config.secret, (err: any, decoded: any) => {
        if (err) {
          reject(new AuthResponseError(false, err.message, err));
        } else {
          // Check if JWT contains all required scopes
          if (scopes) {
            for (const scope of scopes) {
              if (!decoded.scopes.includes(scope)) {
                reject(new AuthResponseError(false, 'JWT does not contain required scope.'));
              }
            }
          }
          resolve(new UserLoginResponse(true, 'You are authorized', null, null, decoded));
        }
      });
    });
  }
}
