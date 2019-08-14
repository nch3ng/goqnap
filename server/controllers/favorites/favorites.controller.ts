import { Controller, Route, Post, Security, Request, Query, Get, Path, Delete, Patch, Put } from "tsoa";
import UserDB from './../../models/schemas/users.schema';
import * as express from 'express';
import { GeneralResponse, ErrorResponse } from "../../models/response.model";
import * as ResponseCode from '../../codes/response';
import { User } from "../../models/user.model";
import CourseDB from '../../models/schemas/courses.schema';

@Route('favorites')
export class FavsController extends Controller {
  @Security('JWT')
  @Post('{id}')
  public async post(@Request() req: express.Request, @Path() id: string): Promise<GeneralResponse> {
    // console.log('get all users');
    const userId = req.user.decoded.userID;
    return new Promise<GeneralResponse> ((resolve, reject) => {
      return CourseDB.findOne({ _id: id }).then((
        (course) => {
          if (course) {
            
            return UserDB.findOne({ _id: userId }).select('favorites').then((user) => {
              
              let favs = user['favorites'];
              console.log(favs)
              if (favs.includes(id)) {
                reject(new ErrorResponse(false, 'Already added', ResponseCode.DUPLICATE_RECORD));
              } else {
                user.favorites.push(id)
                return user.save((error) => {
                  if(error) {
                    reject(new ErrorResponse(false, error, ResponseCode.GENERAL_ERROR));
                  } else {
                    resolve(new GeneralResponse(true, "posted", ResponseCode.GENERAL_SUCCESS, user['favorites']))
                  }
                });
              }
              //   
              // resolve(new GeneralResponse(true, "posted", ResponseCode.GENERAL_SUCCESS, user))
            }).catch(err => {
              reject(new ErrorResponse(false, err, ResponseCode.COURSE_NOT_FOUND));
            });
            
          } else {
            reject(new ErrorResponse(false, 'Course does not exist', ResponseCode.COURSE_NOT_FOUND));
          }
        }
      )).catch( err => {
        reject(new ErrorResponse(false, 'Course does not exist', ResponseCode.COURSE_NOT_FOUND));
      })
      
    });

  }

  @Security('JWT')
  @Get('')
  public async all(@Request() req: express.Request): Promise<GeneralResponse> {
    if (req && req.user && req.user.decoded && req.user.decoded.userID) {
      const id = req.user.decoded.userID; 
      const promise = UserDB.findOne({ _id: id }).select('favorites');
      return new Promise<GeneralResponse> ((resolve, reject) => {
        promise.then(
          (user: User) => {
            if (!user) {
              this.setStatus(500);
              reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
            }
            resolve(new GeneralResponse(true, "got favorites", ResponseCode.GENERAL_SUCCESS, user.favorites));
          }
        ).catch(
          (error) => {
            reject(new ErrorResponse(false, error, ResponseCode.USER_NOT_FOUND));
          });
      });
    } else {
      return new Promise<GeneralResponse>((resolve, reject) => {
        reject(new ErrorResponse(false, 'Not authorized', ResponseCode.NOT_AUTHORIZED));
      });
    }
    // console.log(req.user.decoded.scopes);
  }

  @Security('JWT')
  @Delete('{id}')
  public async delete(@Request() req: express.Request, @Path() id: string): Promise<GeneralResponse> {
    const userId = req.user.decoded.userID;
    console.log(id)
    return new Promise((resolve, reject) => {
      return UserDB.findOne({ _id: userId }).select('favorites').then((user) => {
        for( let i = 0; i < user.favorites.length; i++){
          if ( user.favorites[i] === id) {
            user.favorites.splice(i, 1);
            break;
          }
        }
        return user.save((error) => {
          if(error) {
            reject(new ErrorResponse(false, error, ResponseCode.GENERAL_ERROR));
          } else {
            resolve(new GeneralResponse(true, "Deleted", ResponseCode.GENERAL_SUCCESS, user.favorites))
          }
        });
      });
    });
  }

  @Security('JWT')
  @Get('is/{fid}')
  public async isFav(@Request() req: express.Request, @Path() fid: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const id = req.user.decoded.userID;
      const promise = UserDB.findOne({ _id: id }).select('favorites');

      promise.then(
        (user: User) => {
          if (!user) {
            this.setStatus(500);
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          }

          if (user.favorites.includes(fid)) {
            resolve(new GeneralResponse(true, "It is your favorite.", ResponseCode.GENERAL_SUCCESS, { favorite: true} ));
          } else {
            resolve(new GeneralResponse(true, "It is not your favorite.", ResponseCode.GENERAL_SUCCESS, { favorite: false}));
          }
          
        }
      ).catch(
        (error) => {
          reject(new ErrorResponse(false, error, ResponseCode.USER_NOT_FOUND));
        });
    });
  }

  @Security('JWT')
  @Patch('{fid}/toggle')
  public async tootleFav(@Request() req: express.Request, @Path() fid: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const id = req.user.decoded.userID;
      const promise = UserDB.findOne({ _id: id }).select('favorites');

      promise.then(
        (user) => {
          if (!user) {
            this.setStatus(500);
            reject(new ErrorResponse(false, 'No user found', ResponseCode.USER_NOT_FOUND));
          }
          let msg: string;
          if (user.favorites.includes(fid)) {
            const i = user.favorites.indexOf(fid)
            
            user.favorites.splice(i, 1);
            msg = "Removed"
          } else {
            user.favorites.push(fid)
            msg = "Added"
          }

          return user.save((error) => {
            if(error) {
              reject(new ErrorResponse(false, error, ResponseCode.GENERAL_ERROR));
            } else {
              resolve(new GeneralResponse(true, msg, ResponseCode.GENERAL_SUCCESS, user.favorites ));
            }
          });

          
        }
      ).catch(
        (error) => {
          reject(new ErrorResponse(false, error, ResponseCode.USER_NOT_FOUND));
        });
    });
  }
}