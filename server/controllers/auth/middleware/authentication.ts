import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { UserLoginResponse, AuthResponseError } from '../../../models/user.model';
const env = process.env.NODE_ENV || 'development';

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'JWT') {
    const token = request.body.token || request.query.token || request.headers['x-access-token'];
    // console.log(token);
    return new Promise((resolve, reject) => {
      // console.log('[expressAuthentication]: ', scopes);
      if (!token) {
          reject(new AuthResponseError(false, 'No token provided'));
      }
      jwt.verify(token, process.env.secret, (err: any, decoded: any) => {
        // console.log('[expressAuthentication]: ', decoded);
        if (err) {
          return reject(new AuthResponseError(false, err.message, err));
        } else {
          // Check if JWT contains all required scopes
          if (scopes && scopes.length !== 0) {
            let valid = false;
            
            for (const scope of scopes) {
              if (decoded.scopes.includes(scope)) {
                valid = true;
              }
            }
            if (!valid)
              return reject(new AuthResponseError(false, 'You are not authorized.'));
          }
          return resolve(new UserLoginResponse(true, 'You are authorized', null, null, decoded));
        }
      });
    });
  }
}
