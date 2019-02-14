import { UserCreationResponse } from './../../models/user.model';
import { Post, Body, Route, Get, Path, Delete, Security, Controller, Query, Put, Request } from 'tsoa';
import { UserCreationRequest, User } from '../../models/user.model';
import UserDB from './../../models/schemas/users.schema';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import TokenDB from '../../models/schemas/token.schema';
import * as crypto from 'crypto';
import Mail from '../../helpers/mail';
import { Token } from '../../models/token';
import * as ResponseCode from '../../codes/response';
import Log from '../../models/log';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';

@Route('users')
export class UsersController extends Controller {

  @Security('JWT', ['9'])
  @Get()
  public async all(@Request() req: express.Request): Promise<User []> {
    // console.log('get all users');
    const level = req.user.decoded.scopes.level;
    // console.log(req.user.decoded.scopes);
    return new Promise<User []>((resolve, reject) => {
      const promise = UserDB.find({ 'role.level': { $lte: level } }).select('-salt -hash');
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
  @Security('JWT', ['10'])
  @Post()
  public async create(@Body() requestBody: UserCreationRequest): Promise<UserCreationResponse> {
    return new Promise<UserCreationResponse>((resolve, reject) => {
      if (!requestBody.email) {
        return reject(new ErrorResponse(false, 'Email can not be empty', ResponseCode.USER_CREATION_FAIL));
      }

      if (!requestBody.name) {
        return reject(new ErrorResponse(false, 'Name can not be empty', ResponseCode.USER_CREATION_FAIL));
      }
      UserDB.create({ 
        email: requestBody.email, 
        name: requestBody.name, 
        isVerified: false, 
        hasPasswordBeenSet: false,
        role: {
          name: 'normal',
          level: 1
        } }, (error, user) => {
        if (error) {
          // console.log(error);
          if(error.code == ResponseCode.DUPLICATE_RECORD){
            return reject(new ErrorResponse(false, 'The user already exists', ResponseCode.USER_CREATION_FAIL));
          }
          else {
            return reject(new ErrorResponse(false, error.message, ResponseCode.USER_CREATION_FAIL));
          }
        }

        const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        email_token.save((err) => {
          if (err) return reject(new ErrorResponse(false, err, ResponseCode.USER_CREATION_FAIL));
          // saved!

          const mail = new Mail();
          mail.sendConfirmation(user.email, email_token._userId, email_token.token);
        });

        Log.create({message: ` Admin${user.name} has created a user: ${user.email}`, userId: null, action: 'create user'}).then((res) => {
          console.log(res);
        }, (reason) => {
          console.log(reason);
        })
        return resolve(new UserCreationResponse(true, 'Successfully created a user', email_token));
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
  @Delete('destroy')
  public async destroy(@Request() req: express.Request): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      if (req && req.user && req.user.decoded && req.user.decoded.userID) {
        const id = req.user.decoded.userID;
      
        CommentDB.deleteMany({owner_id: id}).then(
          (result) => {
            if (result) {
              UserDB.findOneAndRemove({_id: req.user.decoded.userID }).then(
                (user) => {
                  if (user) {
                    return resolve(new GeneralResponse(true, 'Successfully removed user', ResponseCode.GENERAL_SUCCESS));
                  } else {
                    return reject(new GeneralResponse(false, 'Something went wrong', ResponseCode.USER_NOT_MATCH));
                  }
                });
            } else {
              return reject(new GeneralResponse(false, 'Something went wrong', ResponseCode.COMMENT_DELETE_FAIL));
            }
          }
        )
      }
    });
  }

  @Security('JWT', ['10'])
  @Delete('{id}')
  public async delete(@Path() id: string): Promise<UserCreationResponse> {
    return new Promise<UserCreationResponse>((resolve, reject) => {

      CommentDB.remove({owner_id: id}).then(
        (result) => {
          if (result) {
            const promise = UserDB.findOneAndRemove({ _id: id});
            promise.then(
              (user: User) => {
                return resolve(new UserCreationResponse(true, 'Successfully deleted ' + user.email))
              }
            ).catch(
              (error) => {
                return reject(new ErrorResponse(false, error, ResponseCode.USER_DELETION_FAIL));
            });
          } else {
            return reject(new GeneralResponse(false, 'Something went wrong', ResponseCode.COMMENT_DELETE_FAIL));
          }
      });
    });
  }

  @Post('verification/{id}')
  public async verification(@Path() id: string, @Query() token?: string, @Query() reset?: number): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const ifReset = reset;
      const promise = UserDB.findOne({ _id: id }).select('-salt -hash');
      promise.then(
        (user: User) => {
          if (!user) {
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          }
          else {
          // Need to resolve
            TokenDB.findOne({ token: token }).then(
              (token: Token) => {

                if (!token) { 
                  console.log('Token is invalid');
                  return reject(new ErrorResponse(false, 'Token is invalid', ResponseCode.TOKEN_IS_INVALID));
                } else {
                  if (ifReset) {
                    user.hasPasswordBeenSet = false;
                    console.log("should reset!")
                  }

                  if (user.isVerified && !user.hasPasswordBeenSet) {
                    return resolve(new GeneralResponse(true, 'Password hasn\'t been created', ResponseCode.PASSWORD_HAS_NOT_BEEN_CREATED));
                  } else if (user.isVerified && user.hasPasswordBeenSet) {
                    return resolve(new GeneralResponse(true, 'User is verified and already set the password', ResponseCode.GENERAL_SUCCESS))
                  } else {

                    UserDB.findOneAndUpdate({ _id: id }, {$set: {
                      isVerified: true
                    }}, null, (err, user) => {
                      if (err) return reject(new ErrorResponse(false, 'Something went wrong', ResponseCode.GENERAL_ERROR));
                      
                      if (user.hasPasswordBeenSet) {
                        return resolve(new GeneralResponse(true, 'User Verified, and password habeen created', ResponseCode.GENERAL_SUCCESS));
                      } else {
                        return resolve(new GeneralResponse(true, 'User Verified but need to create a password', ResponseCode.PASSWORD_HAS_NOT_BEEN_CREATED));
                      }
                    });
                  }
                  
                }
                
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

  @Security('JWT')
  @Post('updateName')
  public async updateName(@Body() requestBody: { firstName: string, lastName: string}, @Request() req: express.Request): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      if (!requestBody.firstName || !requestBody.lastName) {
        return reject(new GeneralResponse(false, 'Please specify first name of last name', ResponseCode.EMPTY_NAME));
      }
      if (req && req.user && req.user.decoded && req.user.decoded.userID) {
        UserDB.findOne({_id: req.user.decoded.userID }).then(
          (user) => {
            if (req.user.decoded.email === user.email) {
              user.firstName = requestBody.firstName;
              user.lastName = requestBody.lastName;
              user.name = user.firstName + ' ' + user.lastName;
              user.save((err, user) => {
                if (err) {
                  return reject(new GeneralResponse(false, err, ResponseCode.GENERAL_ERROR));
                }

                return resolve(new GeneralResponse(true, 'Successfully update name', ResponseCode.GENERAL_SUCCESS, user));
              })
            } else {
              return reject(new GeneralResponse(false, "Something wrong", ResponseCode.GENERAL_ERROR));
            }
          }
        ).catch((e) => {
          console.log(e);
          return reject(new GeneralResponse(false, e, ResponseCode.GENERAL_ERROR));
        });
      }
      
    });
  }
  @Security('JWT', ['10'])
  @Put('set_role/{id}')
  public async set_role(@Body() requestBody: { role: string }, @Path() id: string ): Promise<GeneralResponse> {
    const roles = {
      'super admin': 10,
      'admin': 9,
      'normal': 1
    }
    return new Promise<GeneralResponse>((resolve, reject) => {
      if (!requestBody.role) {
        return reject(new GeneralResponse(false, "Please specify the role name", ResponseCode.GENERAL_ERROR));
      }

      UserDB.findOneAndUpdate({_id: id}, { $set: { role: { name: requestBody.role, level: roles[requestBody.role] }}}, (err, user) => {
        if (err) {
          return reject(new GeneralResponse(false, "Oops, something went wrong!", ResponseCode.GENERAL_ERROR));
        }
        else {
          Log.create({message: `Set ${user.name}'s role to ${requestBody.role}`, userId: user._id, action: 'change role'}).then((res) => {
            console.log(res);
          }, (reason) => {
            console.log(reason);
          })
          return resolve(new GeneralResponse(true, "Successfully set role", ResponseCode.GENERAL_SUCCESS, user));
        }
      })
    });
  }

  @Get('abvn/{id}')
  public async get_abvn(@Path() id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      console.log(id)
      UserDB.findOne({_id: id}, (err, user) => {
        if (err) return reject(new GeneralResponse(false, 'error', ResponseCode.GENERAL_ERROR))
        let name = 'John Doe';
        if (user)
          name = user.name;

        return resolve({
          name: user.name.split(" ").map((n)=>n[0]).join("")
        })
      })
    })
  }

  @Security('JWT', ['9'])
  @Get('{uid}/comments')
  public async get_comments_by_user(@Path() uid: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      
    })
  }
}