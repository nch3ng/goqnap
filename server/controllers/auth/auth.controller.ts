// import { PASSWORD_HAS_NOT_BEEN_CREATED } from './../../codes/response';
import { UserRegisterRequest, UserRegisterResponse, UserChangePasswordRequest, UserChangePasswordResponse } from './../../models/user.model';
import UserDB from '../../models/schemas/users.schema';
import TokenDB from '../../models/schemas/token.schema';
import * as ResCode from '../../codes/response';
import * as crypto from 'crypto';

// const env = process.env.NODE_ENV || 'development';
// logger = require('../../logger');
import * as jwt from 'jsonwebtoken';
import { Route, Post, Body, Get, Security, Query, Path, Request } from 'tsoa';
import { UserLoginRequest, UserLoginResponse } from '../../models/user.model';
import { Token } from '../../models/token';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import Mail from '../../helpers/mail';
import FB, { FacebookApiException } from 'fb';
import Log from '../../models/log';
import { OAuth2Client } from 'google-auth-library';
import * as express from 'express';
import Recaptha from '../../helpers/recaptcha/recaptcha';
import Recaptcha from '../../helpers/recaptcha/recaptcha';


let mongoose = require('mongoose');
@Route('')
export class AuthController {

  @Post('login')
  public async login(@Body() requestBody: UserLoginRequest, @Request() req: express.Request): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse>((resolve, reject) => {

      const recaptchaToken = requestBody['recaptchaToken'];

      if (recaptchaToken) {
        Recaptcha.verify(recaptchaToken, req.connection.remoteAddress).then(
          (res) => {
            const response = JSON.parse(res);
            // console.log(response);
            // console.log(response['score']);
            if(response && response['score'] && +response['score'] > 0.5) {
              UserDB.findOne({'email' : requestBody.email}, (error, user) => {
                if (error) {
                  return reject(new UserLoginResponse(false, error));
                }
        
                // console.log(user);
                if (!user) {
                  reject(new UserLoginResponse(false, 'User does not exist'));
                  return;
                } else {
                  if (!user.isVerified) {
                    return reject(new UserLoginResponse(false, 'This email hasn\'t been verified.', null, {
                      code: ResCode.EMAIL_IS_NOT_VERIFIED,
                      uid: user._id
                    }));
                  }
                  if (!user.hasPasswordBeenSet) {
                    return reject(new UserLoginResponse(false, 'Password has not set yet'));
                  }
                  if (!user.validPassword(requestBody.password)) {
                    reject(new UserLoginResponse(false, 'Incorrect password'));
                    return;
                  }
        
                  if (!process.env.secret || !process.env.expiry ) {
                    reject(new UserLoginResponse(false, 'Something went wrong, please contact site administrator'));
                    return;
                  }
        
                  user.salt = '';
                  user.hash = '';
                  const role = [];
                  role.push(user.role);
                  // console.log(user.role);
                  const token = jwt.sign({
                    userID: user._id,
                    email: user.email,
                    name: user.name,
                    scopes: user.role
                  }, process.env.secret, {
                    expiresIn : 60 * 60 * process.env.expiry
                  });
                  Log.create({message: `${user.name} has logged in.`, userId: user._id, action: 'login'}).then((res) => {
                    // console.log(res);
                  }, (reason) => {
                    console.log(reason);
                  })
                  resolve(new UserLoginResponse(true, 
                                                'You are logged in.', 
                                                token, 
                                                { 
                                                  _id: user._id,
                                                  name: user.name, 
                                                  firstName: user.firstName,
                                                  lastName: user.lastName,
                                                  email: user.email,
                                                  role: user.role,
                                                  isVerified: user.isVerified,
                                                  hasPasswordBeenSet: user.hasPasswordBeenSet
                                                }));
                }
              });
            }
            else {
              return reject(new GeneralResponse(false, 'Please come back later', ResCode.GENERAL_ERROR))
            }
          }
        ).catch(err => {
          return reject(new GeneralResponse(false, err, ResCode.GENERAL_ERROR))
        })

      } else {
        UserDB.findOne({'email' : requestBody.email}, (error, user) => {
          if (error) {
            return reject(new UserLoginResponse(false, error));
          }
  
          // console.log(user);
          if (!user) {
            reject(new UserLoginResponse(false, 'User does not exist'));
            return;
          } else {
            if (!user.isVerified) {
              return reject(new UserLoginResponse(false, 'This email hasn\'t been verified.', null, {
                code: ResCode.EMAIL_IS_NOT_VERIFIED,
                uid: user._id
              }));
            }
            if (!user.hasPasswordBeenSet) {
              return reject(new UserLoginResponse(false, 'Password has not set yet'));
            }
            if (!user.validPassword(requestBody.password)) {
              reject(new UserLoginResponse(false, 'Incorrect password'));
              return;
            }
  
            if (!process.env.secret || !process.env.expiry ) {
              reject(new UserLoginResponse(false, 'Something went wrong, please contact site administrator'));
              return;
            }
  
            user.salt = '';
            user.hash = '';
            const role = [];
            role.push(user.role);
            // console.log(user.role);
            const token = jwt.sign({
              userID: user._id,
              email: user.email,
              name: user.name,
              scopes: user.role
            }, process.env.secret, {
              expiresIn : 60 * 60 * process.env.expiry
            });
            Log.create({message: `${user.name} has logged in.`, userId: user._id, action: 'login'}).then((res) => {
              // console.log(res);
            }, (reason) => {
              console.log(reason);
            })
            resolve(new UserLoginResponse(true, 
                                          'You are logged in.', 
                                          token, 
                                          { 
                                            _id: user._id,
                                            name: user.name, 
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.email,
                                            role: user.role,
                                            isVerified: user.isVerified,
                                            hasPasswordBeenSet: user.hasPasswordBeenSet
                                          }));
          }
        });
      }
      
      
    });
  }

  @Post('register')
  public register(@Body() requestBody: UserRegisterRequest): Promise<UserRegisterResponse> {
    const user = new UserDB();
    // console.log('Register: ');
    // console.log(requestBody);

    user.name = requestBody.firstName + ' ' + requestBody.lastName; 
    user.firstName = requestBody.firstName;
    user.lastName = requestBody.lastName;
    user.email = requestBody.email;

    user.setPassword(requestBody.password);
    user.hasPasswordBeenSet = true;
    user.isVerified = false;
    user.role = {
      name: 'normal',
      level: 1
    }
    const token = user.generateJwt();
    return new Promise<UserRegisterResponse> ((resolve, reject) => {
      user.save((err) => {
        // console.log('register');
        if (err) {
          console.log(err);
          return resolve(new UserRegisterResponse(false, 'Email exists'));
        }
        // console.log(token);
        const decoded = jwt.verify(token, process.env.secret);

        const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
        email_token.save((err) => {
          if (err) return reject(new ErrorResponse(false, err, ResCode.USER_CREATION_FAIL));
          // saved!

          const mail = new Mail();
          mail.sendConfirmation(user.email, email_token._userId, email_token.token, 'validation');
        });

        Log.create({message: `${user.name} registered in.`, userId: user._id, action: 'login'}).then((res) => {
          // console.log(res);
        }, (reason) => {
          console.log(reason);
        })

        resolve(new UserRegisterResponse(true, 'Successfully registered', token, user, decoded));
      });
    });
  }

  @Post('fbLogin')
  public fbLogin(@Body() requestBody: any):Promise<any> {
    return new Promise<any> ((resolve, reject) => {
      // console.log("[FacebookLogin]");
      // console.log("[FacebookLogin]", requestBody);
      // console.log("[FacebookLogin]", process.env.FB_APP_SECRET);
      FB.options({'appSecret': process.env.FB_APP_SECRET});
      FB.options({'scope': "public_profile,email,gender"});
      FB.api('me', { fields: 'id,name,email,gender,timezone,picture', access_token: requestBody.accessToken }, function (res) {
        // console.log(res);
        if (res.error) {
          return reject(new ErrorResponse(false, 'Invalid Facebook Login', ResCode.GENERAL_ERROR));
        }

        UserDB.findOne({'email' : res.email}, (error, user) => {

          if (error) {
            return reject(new UserLoginResponse(false, error));
          }
  
          // console.log(user);
          if (!user) {
            UserDB.create({ email: res.email, name: res.name, isVerified: true, hasPasswordBeenSet: false, role: {name: 'normal', level: 1} }, (error, user) => {
              if (error) {
                // console.log(error);
                return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
              }

              TokenDB.create({_userId: user._id, token: crypto.randomBytes(16).toString('hex')}, (error, token) => {
                if (error) {
                  // console.log(error);
                 return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
                }
                return resolve(new UserLoginResponse(true, "Need to create password", null, {
                  code: ResCode.PASSWORD_HAS_NOT_BEEN_CREATED,
                  token:token.token,
                  uid: token._userId
                }, null));
              })
            });
            return;
          }

          if (!user.hasPasswordBeenSet) {
            TokenDB.create({_userId: user._id, token: crypto.randomBytes(16).toString('hex')}, (error, token) => {
              if (error) {
                // console.log(error);
               return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
              }
              resolve(new UserLoginResponse(true, "Need to create password", null, {
                code: ResCode.PASSWORD_HAS_NOT_BEEN_CREATED,
                token:token.token,
                uid: token._userId
              }, null));
            });
            return;
          }

          user.salt = '';
          user.hash = '';
          const token = jwt.sign({
            userID: user._id,
            email: user.email,
            name: user.name,
            scopes: user.role
          }, process.env.secret, {
            expiresIn : 60 * 60 * process.env.expiry
          });

          Log.create({message: `${user.name} is logged in via Facebook.`, userId: user._id, action: 'login'}).then((res) => {
            // console.log(res);
          }, (reason) => {
            // console.log(reason);
          });

          resolve(
            new UserLoginResponse(true, 
                                    'You are logged in.', 
                                    token, 
                                    { 
                                      _id: user._id,
                                      name: user.name, 
                                      email: user.email,
                                      role: user.role,
                                      firstName: user.firstName,
                                      lastName: user.lastName,
                                      isVerified: user.isVerified,
                                      hasPasswordBeenSet: user.hasPasswordBeenSet
                                    }));
        });
      });
    });
  }

  @Post('googleLogin')
  public googleLogin(@Body() requestBody: any): Promise<any> {
    return new Promise<any> ((resolve, reject) => {
      // console.log("[googleLogin]");
      // console.log("[googleLogin]", requestBody);
      const token = requestBody.accessToken;
      const google_client_id = process.env.GOOGLE_CLIENT_ID;
      const client = new OAuth2Client(google_client_id);
      async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: google_client_id,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // console.log(payload)
        const userid = payload['sub'];

        const email = payload['email'];
        const name = payload['name'];
        const firstName = payload['given_name'];
        const lastName = payload['family_name'];
        const picture = payload['picture'];
        UserDB.findOne({'email' : email}, (error, user) => {

          if (error) {
            return reject(new UserLoginResponse(false, error));
          }
  
          if (!user) {
            UserDB.create({ email: email, firstName: firstName, lastName: lastName, name: name, isVerified: true, hasPasswordBeenSet: false, role: {name: 'normal', level: 1} }, (error, user) => {
              if (error) {
                return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
              }

              TokenDB.create({_userId: user._id, token: crypto.randomBytes(16).toString('hex')}, (error, token) => {
                if (error) {
                 return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
                }
                return resolve(new UserLoginResponse(true, "Need to create password", null, {
                  code: ResCode.PASSWORD_HAS_NOT_BEEN_CREATED,
                  token:token.token,
                  uid: token._userId
                }, null));
              })
            });
            return;
          }

          if (!user.hasPasswordBeenSet) {
            TokenDB.create({_userId: user._id, token: crypto.randomBytes(16).toString('hex')}, (error, token) => {
              if (error) {
               return reject(new ErrorResponse(false, error.message, ResCode.USER_CREATION_FAIL));
              }
              resolve(new UserLoginResponse(true, "Need to create password", null, {
                code: ResCode.PASSWORD_HAS_NOT_BEEN_CREATED,
                token:token.token,
                uid: token._userId
              }, null));
            });
            return;
          }

          user.salt = '';
          user.hash = '';
          const token = jwt.sign({
            userID: user._id,
            email: user.email,
            name: user.name,
            scopes: user.role
          }, process.env.secret, {
            expiresIn : 60 * 60 * process.env.expiry
          });

          Log.create({message: `${user.name} is logged in via Google.`, userId: user._id, action: 'login'}).then((res) => {
            // console.log(res);
          }, (reason) => {
            // console.log(reason);
          });

          resolve(
            new UserLoginResponse(true, 
                                    'You are logged in.', 
                                    token, 
                                    { 
                                      _id: user._id,
                                      name: user.name, 
                                      email: user.email,
                                      firstName: user.firstName,
                                      lastName: user.lastName,
                                      role: user.role,
                                      isVerified: user.isVerified,
                                      hasPasswordBeenSet: user.hasPasswordBeenSet
                                    }));
        });
        // If request specified a G Suite domain:
        //const domain = payload['hd'];
      }

      verify().catch(
        (error) => {
          console.log('Catch Error!');
          console.log(error);
        });
    });
  }

  @Security('JWT')
  @Get('check-state')
  public checkState(): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve) => {
      resolve(new UserLoginResponse(true, 'You are authorized.'));
    });
  }

  @Security('JWT')
  @Post('change-password')
  public changePassword(@Body() requestBody: UserChangePasswordRequest): Promise<UserChangePasswordResponse> {
    return new Promise<UserChangePasswordResponse> ((resolve, reject) => {
      UserDB.findOne({'email' : requestBody.email}, (error, user) => {
        if (error) {
          return reject(new UserLoginResponse(false, error));
        }
        if (!user.validPassword(requestBody.oldPassword)) {
          reject(new UserLoginResponse(false, 'Incorrect password'));
        }
        else {
          user.setPassword(requestBody.password);

          user.save((err) => {
            Log.create({message: `${user.name} has changed passwoord`, userId: user._id, action: 'change password'}).then((res) => {
              // console.log(res);
            }, (reason) => {
              console.log(reason);
            })
            // console.log(token);
            resolve(new UserChangePasswordResponse(true, 'Successfully changed password'));
          });
        }
      });
    });
  }

  @Security('JWT', ['9'])
  @Post('reset-password-admin/{id}')
  public reset_password_admin(@Path() id: string): Promise<UserChangePasswordResponse> {
    return new Promise<UserChangePasswordResponse> ((resolve, reject) => {
      UserDB.findOne({'_id' : id}, (error, user) => {
        if (error) {
          return reject(new UserLoginResponse(false, error));
        }
        else {
          user.hasPasswordBeenSet = false;
          user.save((err) => {

            const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
            email_token.save((err) => {
              if (err) return reject(new ErrorResponse(false, err, ResCode.USER_CREATION_FAIL));
              // saved!

              const mail = new Mail();
              mail.sendConfirmation(user.email, email_token._userId, email_token.token, 'reset');

              Log.create({message: `${user.name} reset email has been sent`, userId: user._id, action: 'reset password'}).then((res) => {
                // console.log(res);
              }, (reason) => {
                console.log(reason);
              })
            });
            
            // console.log(token);
            resolve(new GeneralResponse(true, 'Successfully reset the password', ResCode.GENERAL_SUCCESS));
          });
        }
      });
    });
  }

  @Get('forget-password/{seed}')
  public forget_password_get(@Path() seed: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      if (!seed) {
        return reject(new ErrorResponse(false, 'Please specify a seed', ResCode.GENERAL_ERROR));
      }
      const t_uid = mongoose.Types.ObjectId();
      TokenDB.create({_userId: t_uid, token: crypto.randomBytes(16).toString('hex')}, (error, token) => {
        if (error) {
          // console.log(error);
         return reject(new ErrorResponse(false, error.message, ResCode.GENERAL_ERROR));
        }
        return resolve(new GeneralResponse(true, "Two minutes to retrieve the reset link", ResCode.GENERAL_SUCCESS, {
          token:token.token,
          tuid: t_uid
        }));
      }).catch(e => {
        console.log(e)
      });
    });
  }
  @Post('forget-password/{t_uid}')
  public forget_password(@Path() t_uid: string, @Body() requestBody): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const email = requestBody.email;
      const token = requestBody.token;

      if (!email) {
        return resolve(new GeneralResponse(false, "Please specify email address", ResCode.GENERAL_ERROR));
      }
      if (!token) {
        return resolve(new GeneralResponse(false, "Invalid Request", ResCode.GENERAL_ERROR));
      }

      TokenDB.findOne({ token: token, _userId: t_uid }).then(
        (token: Token) => {
          console.log(token)
          if(token) { 
            UserDB.findOne({email: email}).then(
              (user) => {
                console.log(user);
                if (!user) { 
                  return resolve(new GeneralResponse(false, "Invalid email address", ResCode.GENERAL_ERROR));
                } else {
                  const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
                  email_token.save((err) => {
                    if (err) return reject(new ErrorResponse(false, err, ResCode.GENERAL_ERROR));
                    // saved!

                    const mail = new Mail();
                    mail.sendConfirmation(user.email, email_token._userId, email_token.token, 'reset');
                  });
                  return resolve(new GeneralResponse(true, 'Password reset email has been sent.', ResCode.GENERAL_SUCCESS));
                }
              }
            ).catch(e => {
              console.log(e);
            })
          } else {
            return resolve(new GeneralResponse(false, "Invalid token", ResCode.TOKEN_IS_NOT_PROVIDED));
          }
        }
      ).catch(err => {
        return resolve(new GeneralResponse(false, "No token provided", ResCode.TOKEN_IS_NOT_PROVIDED));
      });
    });
  }

  @Get('check-tmp-state')
  public checkTmpState(@Query() token?: string): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve, reject) => {
      TokenDB.findOne({ token: token }).then(
        (token: Token) => {
          // console.log(token)
          if(token) { 
            return resolve(new GeneralResponse(true, 'You are temporarily authorized.', ResCode.GENERAL_SUCCESS));
          }
          return reject(new ErrorResponse(false, "No token provided", ResCode.TOKEN_IS_NOT_PROVIDED));
        }
      ).catch(err => {
        return reject(new ErrorResponse(false, "No token provided", ResCode.TOKEN_IS_NOT_PROVIDED));
      });
    });
  }
}
