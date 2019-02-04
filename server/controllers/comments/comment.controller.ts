import { Route, Controller, Get, Security, Request, Post, Body, Path } from 'tsoa';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';
import { GeneralResponse } from '../../models/response.model';
import * as ResponseCode from '../../codes/response';
import CourseDB from '../../models/schemas/courses.schema';
@Route('comment')
export class CommentController extends Controller {

  @Security('JWT')
  @Post()
  postAComment(@Request() req: express.Request, @Body() requestBody: any): Promise<Comment []> {
    console.log(req.user.decoded.userID);
    const uid = req.user.decoded.userID;
    const cid = requestBody.course_id;
    const comment = requestBody.comment;

    console.log(requestBody);
    return new Promise<Comment []>((resolve, reject) => {
      if (!requestBody.comment || requestBody.post_id){
        return reject(new GeneralResponse(false, 'Fields can not be empty', ResponseCode.GENERAL_ERROR));
      }

      if (requestBody.recaptchaToken) {
        setTimeout(() => {
          //fake verifying
          CommentDB.create({
            owner_id: uid,
            course_id: cid,
            comment: comment,
            createdAt: Date.now(),
          }, (error, comment) => {
            if (error) return reject(new GeneralResponse(false, error, ResponseCode.GENERAL_ERROR));
    
            CourseDB.findOne({_id: cid}, (error2, course) => {
              if (error2) return reject(new GeneralResponse(false, error2, ResponseCode.GENERAL_ERROR));
    
              
              if(course.comments === null) {
                console.log(typeof course.comments);
                course.comments.push(comment._id)
              } else {
                // let comments;
                // Object.assign(comments, course.comments);
                course.comments.push(comment._id);
                // course.comments = comments;
              }
              course.save((error1) => {
                if (error1) return reject(new GeneralResponse(false,  error1, ResponseCode.GENERAL_ERROR));
    
                return resolve(comment);
              })
              // return resolve(comment);
            })
          });

        },1000)
      } else {

        CommentDB.create({
          owner_id: uid,
          course_id: cid,
          comment: comment,
          createdAt: Date.now(),
        }, (error, comment) => {
          if (error) return reject(new GeneralResponse(false, error, ResponseCode.GENERAL_ERROR));

          CourseDB.findOne({_id: cid}, (error2, course) => {
            if (error2) return reject(new GeneralResponse(false, error2, ResponseCode.GENERAL_ERROR));

            
            if(course.comments === null) {
              console.log(typeof course.comments);
              course.comments.push(comment._id)
            } else {
              // let comments;
              // Object.assign(comments, course.comments);
              course.comments.push(comment._id);
              // course.comments = comments;
            }
            course.save((error1) => {
              if (error1) return reject(new GeneralResponse(false,  error1, ResponseCode.GENERAL_ERROR));

              return resolve(comment);
            })
            // return resolve(comment);
          })
        });
      }
    });
  }
}
