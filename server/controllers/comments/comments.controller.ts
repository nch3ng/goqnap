import { GeneralResponse } from './../../models/response.model';
import { Comment } from './../../models/comment.model';
import { Route, Controller, Get, Security, Request, Path, Post, Query } from 'tsoa';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';
import * as ResponseCode from '../../codes/response';
import CourseDB from '../../models/schemas/courses.schema';
import UserDB from '../../models/schemas/users.schema';

@Route('comments')
export class CommentsController extends Controller {

  @Security('JWT')
  @Get()
  all(@Request() req: express.Request): Promise<Comment []> {
    return new Promise<Comment []>((resolve, reject) => {
      resolve([]);
    })
  }

  @Get('course/{courseId}')
  getCommentsByCourseId(@Path() courseId: string): Promise<Comment []> {
    return new Promise<Comment []>((resolve, reject) => {
      CommentDB.find({ course_id: courseId}, null, {sort: '-createdAt'}, (err, comments) => {
        if (err) return reject(new GeneralResponse(false, 'Somoething went wrong', ResponseCode.GENERAL_ERROR));

        if (comments)
          return resolve(comments);
        else 
          return resolve([]);
      })
    })
  }

  @Security('JWT')
  @Get('user/{uid}/search')
  searchCommentsOfUser(@Path() uid: string, @Query() query: string, @Request() req: express.Request): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {

      if (uid !== req.user.decoded.userID && req.user.decoded.scopes.level < 9)
        return reject(new GeneralResponse(false, "You are not authorized.", ResponseCode.GENERAL_ERROR))

      const queryStr = query;
      if (queryStr) {
        const promise = CommentDB.find({owner_id: uid, $text: {$search: queryStr}});
        promise.then(
          searched_courses => resolve(new GeneralResponse(true, "get comments", ResponseCode.GENERAL_SUCCESS, searched_courses))).catch(
          err => {
            // console.error(err);
            resolve(new GeneralResponse(true, "get comments", ResponseCode.GENERAL_SUCCESS, []));
          });
      } else {
        resolve(new GeneralResponse(true, "get comments", ResponseCode.GENERAL_SUCCESS, []));
      }
    });
  }

  @Security('JWT')
  @Get('user/{uid}/count')
  getCountOfCommentsOfUser(@Path() uid: string, @Request() req: express.Request): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {

      if (uid !== req.user.decoded.userID && req.user.decoded.scopes.level < 9)
        return reject(new GeneralResponse(false, "You are not authorized.", ResponseCode.GENERAL_ERROR))

      const promise = CommentDB.count({owner_id: uid});
      promise.then(
        count => resolve(new GeneralResponse(true, "get count of comments", ResponseCode.GENERAL_SUCCESS, count))).catch(
        err => {
          // console.error(err);
          if (err) {
            return resolve(new GeneralResponse(false, err, ResponseCode.GENERAL_ERROR));
          }
          resolve(new GeneralResponse(true, "get comments", ResponseCode.GENERAL_SUCCESS, 0));
        });
    });
  }
  @Security('JWT')
  @Get('user/{uid}')
  getCommentsByUserId(@Path() uid: string, @Request() req: express.Request, @Query() limit?: number, @Query() page?: number): Promise<GeneralResponse>{
    
    return new Promise<GeneralResponse>((resolve, reject) => {

      if (uid !== req.user.decoded.userID && req.user.decoded.scopes.level < 9)
        return reject(new GeneralResponse(false, "You are not authorized.", ResponseCode.GENERAL_ERROR))

      CommentDB.paginate({owner_id: uid},
        { 
          page: page || 1,
          limit: limit || 10
        }).then((docs) => {
        resolve(new GeneralResponse(true, "Successfully get comments", ResponseCode.GENERAL_SUCCESS, docs))
      }).catch(e => {
        reject(new GeneralResponse(false, e, ResponseCode.GENERAL_ERROR))
      })
    })
  }

  @Security('JWT', ['9'])
  @Post('check')
  checkComments(): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      CommentDB.find({}).then((comments) => {
        for (let i = 0; i < comments.length; i++) {
          // console.log(comments[i].course_id)
          CourseDB.findOne({_id: comments[i].course_id}).then((course) => {

            if (!course) {
              // console.log('course doesn\'t exist')
              comments[i].remove().then((comment) => {
                // console.log('removed');
              })
            }
            else{
            }
          });
          console.log('owner id', comments[i].owener_id);

          UserDB.findOne({_id: comments[i].owener_id}).then((user) => {
            if(!user) {
              comments[i].remove().then((comment) => {
                console.log('removed');
              })
            }
          });
        }

        resolve(new GeneralResponse(true, "", ResponseCode.GENERAL_SUCCESS));
      })
    });
  }
}
