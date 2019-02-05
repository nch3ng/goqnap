import { GeneralResponse } from './../../models/response.model';
import { Comment } from './../../models/comment.model';
import { Route, Controller, Get, Security, Request, Path, Post } from 'tsoa';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';
import * as ResponseCode from '../../codes/response';
import CourseDB from '../../models/schemas/courses.schema';

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

  @Security('JWT', ['9'])
  @Post('check')
  checkComments(): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      CommentDB.find({}).then((comments) => {
        for (let i = 0; i < comments.length; i++) {
          console.log(comments[i].course_id)
          CourseDB.findOne({_id: comments[i].course_id}).then((course) => {

            if (!course) {
              console.log('course doesn\'t exist')
              comments[i].remove().then((comment) => {
                console.log('removed');
              })
            }
            else{
            }
          })
        }

        resolve(new GeneralResponse(true, "", ResponseCode.GENERAL_SUCCESS));
      })
    });
  }
}
