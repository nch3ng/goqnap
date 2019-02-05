import { Route, Controller, Get, Security, Request, Post, Body, Path, Delete } from 'tsoa';
import * as express from 'express';
import CommentDB from '../../models/schemas/comments';
import { GeneralResponse } from '../../models/response.model';
import * as ResponseCode from '../../codes/response';
import CourseDB from '../../models/schemas/courses.schema';
import * as request from 'request';

@Route('comment')
export class CommentController extends Controller {

  @Security('JWT')
  @Post()
  postAComment(@Request() req: express.Request, @Body() requestBody: any): Promise<Comment []> {
    // console.log(req.user.decoded.userID);
    const uid = req.user.decoded.userID;
    const cid = requestBody.course_id;
    const comment = requestBody.comment;

    // console.log(requestBody);
    return new Promise<Comment []>((resolve, reject) => {
      if (!requestBody.comment || requestBody.post_id){
        return reject(new GeneralResponse(false, 'Fields can not be empty', ResponseCode.GENERAL_ERROR));
      }

      if (requestBody.recaptchaToken) {

          // Verifying

          const recpatcha_secret = process.env.reCAPTCHA_SECRET;

          const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + recpatcha_secret + "&response=" + requestBody.recaptchaToken + "&remoteip=" + req.connection.remoteAddress;
          
          console.log(verificationUrl);

          request(verificationUrl,function(error,response,body) {
            body = JSON.parse(body);
            // Success will be true or false depending upon captcha validation.
            if(body.success !== undefined && body.success) {
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
                    // console.log(typeof course.comments);
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
            } else {
              // Verying failed.
              reject(new GeneralResponse(false, 'reCaptcha verifying failed', ResponseCode.GENERAL_ERROR));
            }
          });

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

  @Security('JWT')
  @Delete('{cid}')
  deleteAComment(@Request() req: express.Request, @Path() cid: string): Promise<GeneralResponse> {
    const uid = req.user.decoded.userID;
    const level = req.user.decoded.scopes.level;

    return new Promise<GeneralResponse>((resolve, reject) => {
      if (!cid) return reject(new GeneralResponse(false, 'Please specify comment id.', ResponseCode.GENERAL_ERROR))

      // const promise = CommentDB.findOneAndRemove({

      let promise = CommentDB.findOneAndRemove({
                            _id: cid, 
                            owner_id: uid});

      if (level >= 9) {
        promise = CommentDB.findOneAndRemove({
          _id: cid
        });
      }

      promise.then((comment) => {
        if (comment) {
          const p = CourseDB.findOne({_id: comment.course_id})
          console.log(comment);
          p.then((course) => {
            

            if (course && course.comments) {
              console.log(course.comments);
              for (let i = 0; i < course.comments.length; i++) {
                if (course.comments[i] == cid) {
                  course.comments.slice(i, 1);
                }
              }

              course.save().then(() => {
                console.log('Removed comment from the course');
              });
            }
            resolve(new GeneralResponse(true, 'Successfully deleted the comment', ResponseCode.GENERAL_SUCCESS));
          })
        } else {
          reject(new GeneralResponse(false, 'You are not authorized to delete this comment', ResponseCode.GENERAL_ERROR))
        }
      }).catch((err) => {
        return reject(new GeneralResponse(false, 'No comment to be deleted, ResponseCode.GENERAL_ERROR', ResponseCode.GENERAL_ERROR))
      })
    })
  }
}
