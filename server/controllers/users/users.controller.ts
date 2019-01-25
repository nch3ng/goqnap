import { UserCreationResponse } from './../../models/user.model';
import { Post, Body, SuccessResponse, Route, Get, Path, Delete, Security, Controller, Query } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users.schema';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import TokenDB from '../../models/schemas/token.schema';
import * as crypto from 'crypto';
import Mail from '../../helpers/mail';
import { IResponse } from '../../models/interfaces/response.interface';
import { Token } from '../../models/token';
import * as ResponseCode from '../../codes/response';

@Route('users')
export class UsersController extends Controller {

  @Security('JWT')
  @Get()
  public async all(): Promise<User []> {
    return new Promise<User []>((resolve, reject) => {
      const promise = UserDB.find({}).select('-salt -hash');
      promise.then(
        (users: User []) => {
          if (!users) {
            resolve([]);
          }
          resolve(users);
        }
      ).catch( (e) => {
      });
    });
  }
}

@Route('user')
export class UserController extends Controller {
  @Security('JWT')
  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<UserCreationResponse> {
    console.log(requestBody);
    return new Promise<UserCreationResponse>((resolve, reject) => {
      UserDB.create({ email: requestBody.email, isVerified: false, hasPasswordBeenSet: false }, (error, user) => {
        if (error) {
          console.log(error);
          reject(new ErrorResponse(false, error, ResponseCode.USER_CREATION_FAIL));
        }
        const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        email_token.save((err) => {
          if (err) return reject(new ErrorResponse(false, error, ResponseCode.USER_CREATION_FAIL));
          // saved!

          const mail = new Mail();
          mail.sendConfirmation(user.email, email_token._userId, email_token.token);
        });
        resolve(new UserCreationResponse(true, 'Successfully created a user', email_token));
      });
    });
  }

  @Security('JWT')
  @Get('{id}')
  public async get(@Path() id: string): Promise<User> {
    return new Promise<User> ((resolve, reject) => {
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');

      promise.then(
        (user: User) => {
          if (!user) {
            this.setStatus(500);
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          }
          resolve(user);
        }
      ).catch(
        (error) => {
          reject(new ErrorResponse(false, error, ResponseCode.USER_NOT_FOUND));
        });
    });
  }

  @Security('JWT')
  @Delete('{id}')
  public async delete(@Path() id: string): Promise<UserCreationResponse> {
    return new Promise<UserCreationResponse>((resolve, reject) => {
      const promise = UserDB.findOneAndRemove({ _id: id});
      promise.then(
        (user: User) => {
          resolve(new UserCreationResponse(true, 'Successfully deleted ' + user.email));
        }
      ).catch(
        (error) => {
          reject(new ErrorResponse(false, error, ResponseCode.USER_DELETION_FAIL));
      });
    });
  }

  @Post('verification/{id}')
  public async verification(@Path() id: string, @Query() token?: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');
      promise.then(
        (user: User) => {
          if (!user) {
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          }
          // Need to resolve
          TokenDB.findOne({ token: token }).then(
            (token: Token) => {

              if (!token) { 
                console.log('Token is invalid');
                reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID));
              }
              
              resolve(new GeneralResponse(true, 'User Verified'));
            }
          ).catch(
            (error: any) => { 
              console.log('Catch error');
              reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID)); 
            }
          )
        }
      ).catch(
        (error: any) => { reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND)); }
      );    
      // resolve(new GeneralResponse(true, 'get the confirmation'));
    });
  }

}