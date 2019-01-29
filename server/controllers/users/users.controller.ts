import { UserCreationResponse } from './../../models/user.model';
import { Post, Body, Route, Get, Path, Delete, Security, Controller, Query, Put } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users.schema';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import TokenDB from '../../models/schemas/token.schema';
import * as crypto from 'crypto';
import Mail from '../../helpers/mail';
import { Token } from '../../models/token';
import * as ResponseCode from '../../codes/response';

@Route('users')
export class UsersController extends Controller {

  @Security('JWT', ['super admin', 'admin'])
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
  @Security('JWT', ['super admin'])
  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<UserCreationResponse> {
    return new Promise<UserCreationResponse>((resolve, reject) => {
      if (!requestBody.email) {
        return reject(new ErrorResponse(false, 'Email can not be empty', ResponseCode.USER_CREATION_FAIL));
      }

      if (!requestBody.name) {
        return reject(new ErrorResponse(false, 'Name can not be empty', ResponseCode.USER_CREATION_FAIL));
      }
      UserDB.create({ email: requestBody.email, name: requestBody.name, isVerified: false, hasPasswordBeenSet: false }, (error, user) => {
        if (error) {
          // console.log(error);
          if(error.code == ResponseCode.DUPLICATE_RECORD){
            reject(new ErrorResponse(false, 'The user already exists', ResponseCode.USER_CREATION_FAIL));
          }
          else {
            reject(new ErrorResponse(false, error.message, ResponseCode.USER_CREATION_FAIL));
          }
        }
        const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        email_token.save((err) => {
          if (err) return reject(new ErrorResponse(false, err, ResponseCode.USER_CREATION_FAIL));
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

  @Security('JWT', ['super admin'])
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
          else {
            if (user.isVerified && !user.hasPasswordBeenSet) {
              return resolve(new GeneralResponse(true, 'Password hasn\'t been created', ResponseCode.PASSWORD_HAS_NOT_BEEN_CREATED));
            } else if (user.isVerified && user.hasPasswordBeenSet) {
              return resolve(new GeneralResponse(true, 'User is verified and already set the password', ResponseCode.GENERAL_SUCCESS))
            }
          // Need to resolve
            TokenDB.findOne({ token: token }).then(
              (token: Token) => {

                if (!token) { 
                  console.log('Token is invalid');
                  return reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID));
                }

                UserDB.findOneAndUpdate({ _id: id }, {$set: {
                  isVerified: true
                }}, null, (err, user) => {
                  if (err) return reject(new ErrorResponse(false, 'Something went wrong', ResponseCode.GENERAL_ERROR));
                  
                  if (user.hasPasswordBeenSet) {
                    return resolve(new GeneralResponse(true, 'User Verified, and password has neem created', ResponseCode.GENERAL_SUCCESS));
                  } else {
                    return resolve(new GeneralResponse(true, 'User Verified but need to create a password', ResponseCode.PASSWORD_HAS_NOT_BEEN_CREATED));
                  }
                });
                
                
                
              }
            ).catch(
              (error: any) => { 
                console.log('Catch error', error);
                return reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID)); 
              }
            )
          }
        }
      ).catch(
        (error: any) => { return reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND)); }
      );    
      // resolve(new GeneralResponse(true, 'get the confirmation'));
    });
  }

  @Post('resend_verification/{id}')
  public async resendVerification(@Path() id: string, @Query() token?: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');
      promise.then(
        (user: User) => {
          if (!user) {
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          } else {
            const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

            email_token.save((err) => {
              if (err) return reject(new ErrorResponse(false, err, ResponseCode.GENERAL_ERROR));
                // saved!

              const mail = new Mail();
              mail.sendConfirmation(user.email, email_token._userId, email_token.token);
              return resolve(new GeneralResponse(true, 'Email has been sent out', ResponseCode.GENERAL_SUCCESS));
            });
          }
        });
    });
  }

  @Post('create_password/{id}')
  public async create_password(@Body() requestBody: { password: string }, @Path() id: string, @Query() token?: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      console.log(requestBody.password)
      if (!requestBody.password) {
        return reject(new ErrorResponse(false, 'NOT OK', ResponseCode.GENERAL_ERROR));
      }
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');
      promise.then(
        (user: any) => {
          if (user) {

            TokenDB.findOne({ token: token }).then(
              (token: any) => {

                if (!token) { 
                  console.log('Token is invalid');
                  return reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID));
                }

                user.hasPasswordBeenSet = true;
                user.setPassword(requestBody.password);
                user.save();

                token.remove();
                
                return resolve(new GeneralResponse(true, 'OK', ResponseCode.GENERAL_SUCCESS));
              }
            );
          } else{
            return reject(new ErrorResponse(false, 'NOT OK', ResponseCode.USER_NOT_FOUND));
          }
        }
      );
    })
  }

  @Security('JWT', ['super admin'])
  @Put('set_role/{id}')
  public async set_role(@Body() requestBody: { role: string }, @Path() id: string ): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      if (!requestBody.role) {
        return reject(new GeneralResponse(false, "Please specify the role name", ResponseCode.GENERAL_ERROR));
      }

      UserDB.findOneAndUpdate({_id: id}, { $set: { role: requestBody.role }}, (err, user) => {
        if (err) {
          return reject(new GeneralResponse(false, "Oops, something went wrong!", ResponseCode.GENERAL_ERROR));
        }
        else {
          return resolve(new GeneralResponse(true, "Successfully set role", ResponseCode.GENERAL_SUCCESS, user));
        }
      })
    });
  }
}