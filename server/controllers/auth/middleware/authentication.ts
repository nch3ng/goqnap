import * as jwt from 'jsonwebtoken';
import * as express from 'express';
const env = process.env.NODE_ENV || 'development';
const config = require('../../../config')[env];

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.body.token || request.query.token || request.headers['x-access-token'];
    return new Promise((resolve, reject) => {
      // console.log('promise');

      if (!token) {
          reject('No token provided');
      }
      jwt.verify(token, config.secret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          // Check if JWT contains all required scopes
          if (scopes) {
            for (const scope of scopes) {
              if (!decoded.scopes.includes(scope)) {
                reject('JWT does not contain required scope.');
              }
            }
          }
          resolve(decoded);
        }
      });
    });
  }
}
