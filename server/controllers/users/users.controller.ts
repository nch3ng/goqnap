import { Post, Body, SuccessResponse, Route, Get } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users';


@Route('users')
export class UsersController {

  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<void> {
  }

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
