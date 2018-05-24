import { UserLoginResponse, AuthResponseError } from '../models/user.model';
import { ErrorResponse } from '../models/response.model';

export function authErrorHandler(error, req, res, next) {

  if (res.statusCode === 401) {
    if (error instanceof AuthResponseError) {
      res.json(error);
    }
  }

  // We check everything, when error was given, even the status code is 200 from tsoa
  if (res.statusCode === 500  || res.statusCode === 200) {
    if (error instanceof ErrorResponse || error instanceof UserLoginResponse) {
      res.status(500).json(error);
    } else {
      res.status(500).json(new ErrorResponse(false, 'Oops, unknown error happrned.'));
    }
  }

  next();
}
