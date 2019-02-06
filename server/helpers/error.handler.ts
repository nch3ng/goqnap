import { UserLoginResponse, AuthResponseError } from '../models/user.model';
import { ErrorResponse, GeneralResponse } from '../models/response.model';
import * as ResponseCode from '../codes/response'

export function errorHandler(error, req, res, next) {
  if (res.statusCode === 401) {
    if (error instanceof AuthResponseError) {
      res.json(error);
    }
  } else if (res.statusCode === 500  || res.statusCode === 200) {
    if (error instanceof GeneralResponse ||
        error instanceof ErrorResponse || 
        error instanceof UserLoginResponse || 
        error instanceof AuthResponseError) {
      res.status(500).json(error);
    } else {
      // console.log(error);
      res.status(500).json(new ErrorResponse(false, 'Oops, unknown error happrned.', ResponseCode.GENERAL_ERROR));
    }
  }
  next();
}
