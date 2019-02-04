import { GeneralResponse } from './../../models/response.model';
import { Comment } from './../../models/comment.model';
import { Route, Controller, Get, Security, Request, Path } from 'tsoa';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';
import * as ResponseCode from '../../codes/response';

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
}
