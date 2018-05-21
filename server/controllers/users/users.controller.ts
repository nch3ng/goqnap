import { UserCreationResponse } from './../../models/user.model';
import { Post, Body, SuccessResponse, Route, Get, Path, Delete, Security } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users.schema';

@Security('api_key')
@Route('users')
export class UsersController {

  @Get()
  public async all(): Promise<User []> {
    return new Promise<User []>((resolve, reject) => {
      const promise = UserDB.find({}).select('-salt -hash').exec();
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

@Security('api_key')
@Route('user')
export class UserController {

  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<UserCreationResponse> {
    console.log(requestBody);
    return new Promise<UserCreationResponse>((resolve, reject) => {
      UserDB.create({ email: requestBody.email }, (error, user) => {
        if (error) {
          reject(new Error(error));
        }

        resolve(new UserCreationResponse(true, 'Successfully created a user'));
      });
    });
  }

  @Get('{id}')
  public async get(@Path() id: string): Promise<User> {
    return new Promise<User> ((resolve, reject) => {
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash').exec();

      promise.then(
        (user: User) => {
          if (!user) {
            reject('No user found');
          }
          resolve(user);
        }
      ).catch(
        (error) => {
          reject(error);
        });
    });
  }

  @Delete('{id}')
  public async delete(@Path() id: string): Promise<UserCreationResponse> {
    return new Promise<UserCreationResponse>((resolve, reject) => {
      const promise = UserDB.findOneAndRemove({ _id: id}).exec();
      promise.then(
        (user: User) => {
          resolve(new UserCreationResponse(true, 'Successfully deleted ' + user.email));
        }
      ).catch(
        (error) => {
          reject(error);
      });
    });
  }
}
