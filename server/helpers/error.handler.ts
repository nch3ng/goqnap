import { UserLoginResponse, AuthResponseError } from '../models/user.model';

export function authErrorHandler(error, req, res, next) {
  console.log(error);
  console.log(error instanceof AuthResponseError);
  console.log(res.sentry);
  console.log(res.statusCode);

  if (res.statusCode === 401) {
    if (error instanceof AuthResponseError) {
      res.json(error);
    }
  }

  if (res.statusCode === 500) {
    res.json('Oops, something went wrong');
  }

  next();
}
