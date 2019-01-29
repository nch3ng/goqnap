import { PASSWORD_HAS_NOT_BEEN_CREATED } from './../../codes/response';
import { UserRegisterRequest, UserRegisterResponse, User, UserChangePasswordRequest, UserChangePasswordResponse } from './../../models/user.model';
import UserDB from '../../models/schemas/users.schema';
import TokenDB from '../../models/schemas/token.schema';
import * as ResCode from '../../codes/response';
import * as crypto from 'crypto';

const env = process.env.NODE_ENV || 'development';
// logger = require('../../logger');
import * as jwt from 'jsonwebtoken';
import { Route, Post, Body, Get, Security, Query } from 'tsoa';
import { UserLoginRequest, UserLoginResponse } from '../../models/user.model';
import { Token } from '../../models/token';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import Mail from '../../helpers/mail';
import FB, { FacebookApiException } from 'fb';

@Route('')
export class AuthController {

  @Post('login')
  public async login(@Body() requestBody: UserLoginRequest): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse>((resolve, reject) => {

      UserDB.findOne({'email' : requestBody.email}, (error, user) => {
        if (error) {
          return reject(new UserLoginResponse(false, error));
        }

        // console.log(user);
        if (!user) {
          reject(new UserLoginResponse(false, 'User does not exist'));
          return;
        } else {

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
          const token = jwt.sign({
            userID: user._id,
            email: user.email,
            name: user.name,
            scopes: role
          }, process.env.secret, {
            expiresIn : 60 * 60 * process.env.expiry
          });
          resolve(new UserLoginResponse(true, 
                                        'You are logged in.', 
                                        token, 
                                        { 
                                          name: user.name, 
                                          email: user.email,
                                          role: user.role,
                                          isVerified: user.isVerified,
                                          hasPasswordBeenSet: user.hasPasswordBeenSet
                                        }));
        }
      });
    });
  }

  @Post('register')
  public register(@Body() requestBody: UserRegisterRequest): Promise<UserRegisterResponse> {
    const user = new UserDB();
    // console.log('Register: ');
    // console.log(requestBody);

    user.name = requestBody.name;
    user.email = requestBody.email;

    user.setPassword(requestBody.password);
    user.hasPasswordBeenSet = true;
    user.isVerified = false;
    const token = user.generateJwt();
    return new Promise<UserRegisterResponse> ((resolve, reject) => {
      user.save((err) => {
        // console.log('register');
        if (err) {
          // console.log(err);
          reject(new UserRegisterResponse(false, 'Email exists'));
        }
        // console.log(token);
        const decoded = jwt.verify(token, process.env.secret);

        const email_token = new TokenDB({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
        email_token.save((err) => {
          if (err) return reject(new ErrorResponse(false, err, ResCode.USER_CREATION_FAIL));
          // saved!

          const mail = new Mail();
          mail.sendConfirmation(user.email, email_token._userId, email_token.token);
        });

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
        UserDB.findOne({'email' : res.email}, (error, user) => {

          if (error) {
            return reject(new UserLoginResponse(false, error));
          }
  
          // console.log(user);
          if (!user) {
            UserDB.create({ email: res.email, name: res.name, isVerified: true, hasPasswordBeenSet: false }, (error, user) => {
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
          const role = [];
          role.push(user.role);
          const token = jwt.sign({
            userID: user._id,
            email: user.email,
            name: user.name,
            scopes: role
          }, process.env.secret, {
            expiresIn : 60 * 60 * process.env.expiry
          });
          resolve(
            new UserLoginResponse(true, 
                                    'You are logged in.', 
                                    token, 
                                    { 
                                      name: user.name, 
                                      email: user.email,
                                      role: user.role,
                                      isVerified: user.isVerified,
                                      hasPasswordBeenSet: user.hasPasswordBeenSet
                                    }));
        });
      });
      // const signedRequestValue = requestBody.signedRequest;
      // const signedRequest  = FB.parseSignedRequest(signedRequestValue);
      // if(signedRequest) {
      //   console.log(signedRequest);
      // }
      // resolve(new UserLoginResponse(true, 'You are authorized.'));
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

            // console.log(token);
            resolve(new UserChangePasswordResponse(true, 'Successfully changed password'));
          });
        }
      });
    });
  }

  @Get('check-tmp-state')
  public checkTmpState(@Query() token?: string): Promise<UserLoginResponse> {
    return new Promise<UserLoginResponse> ((resolve, reject) => {
      console.log('check temp state', token);
      TokenDB.findOne({ token: token }).then(
        (token: Token) => {
          console.log(token)
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
