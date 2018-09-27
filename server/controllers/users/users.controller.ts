import { UserCreationResponse } from './../../models/user.model';
import { Post, Body, SuccessResponse, Route, Get, Path, Delete, Security, Controller } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users.schema';
import { ErrorResponse } from '../../models/response.model';
import TokenDB from '../../models/schemas/token.schema';
import * as crypto from 'crypto';

@Security('JWT')
@Route('users')
export class UsersController extends Controller {

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

@Security('JWT')
@Route('user')
export class UserController extends Controller {

  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<UserCreationResponse> {
    console.log(requestBody);
    return new Promise<UserCreationResponse>((resolve, reject) => {
      UserDB.create({ email: requestBody.email }, (error, user) => {
        if (error) {
          console.log(error);
          reject(new ErrorResponse(false, error));
        }
        // const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        resolve(new UserCreationResponse(true, 'Successfully created a user'));
      });
    });
  }

  @Get('{id}')
  public async get(@Path() id: string): Promise<User> {
    return new Promise<User> ((resolve, reject) => {
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');

      promise.then(
        (user: User) => {
          if (!user) {
            this.setStatus(500);
            reject(new ErrorResponse(false, 'No user found'));
          }
          resolve(user);
        }
      ).catch(
        (error) => {
          reject(new ErrorResponse(false, error));
        });
    });
  }

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
          reject(new ErrorResponse(false, error));
      });
    });
  }
}
