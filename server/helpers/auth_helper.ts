import * as jwt from 'jsonwebtoken';

export const getJWTToken = (id: string, email: string, name: string, scope: string, expiry: number) => {
  return jwt.sign({
    userID: id,
    email: email,
    name: name,
    scopes: scope
  }, process.env.secret, {
    expiresIn : 60 * 60 * expiry
  });
}