/*jslint node: true */
'use strict';

import * as express from 'express';
const courses_router = express.Router();
import Course from '../../models/courses';

import YoutubeVideoInfo from '@joegesualdo/youtube-video-info-node';


courses_router.get('/', function (req, res) {

  console.log(req.query['orderBy']);
  let orderBy;
  let desc = true;
  if (req.query['orderBy']) {
    orderBy = req.query['orderBy'].split(':')[0];
    console.log(req.query['orderBy'].split(':')[1]);
  }
  console.log(orderBy);
  let courses = [];
  const promise = Course.find({}).exec();

  promise.then(
    (rcourses) => {
      // for (let i = 0; i < rcourses.length; i++) {
      //   let course = Object.assign({}, rcourses[i]);
        
      //   console.log(course['_doc']['youtube_ref']);
      //   new YoutubeVideoInfo(course['_doc']['youtube_ref'])
      //     .then(instance => {
      //       instance.getInfo()
      //       .then(info => {
      //         console.log(course['_doc']['_id'] + ': ' + info['publishedDate']);
      //         let promise = Course.findOneAndUpdate({_id: course['_doc']['_id']}, { $set: { publishedDate: info['publishedDate']}}, {new: true}).exec();

      //         promise.then((doc) => {
      //           console.log(doc);
      //         }, (err) => {});
      //       })
      //       .catch(err => {
      //         console.log(err);
      //       });
      //     });
      // }
      courses = rcourses;
      res.json(courses);
    }).catch(error => {
  });
});
module.exports = {
  courses: courses_router
};
