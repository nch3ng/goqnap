import { UserLoginResponse, AuthResponseError } from '../models/user.model';
import { ErrorResponse } from '../models/response.model';

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

  if (res.statusCode === 500  || res.statusCode === 200) {
    if (error instanceof ErrorResponse || error instanceof UserLoginResponse) {
      res.status(500).json(error);
    } else {
      res.status(500).json(new ErrorResponse(false, 'Oops, unknown error happrned.'));
    }
  }

  next();
}
