/*jslint node: true */
'use strict';

import * as express from 'express';
const courses_router = express.Router();
import Course from '../../models/courses';

import YoutubeVideoInfo from '@joegesualdo/youtube-video-info-node';


courses_router.get('/', function (req, res) {

  // console.log(req.query['orderBy']);
  let orderBy;
  let desc = false;
  let limit = 0;
  if (req.query['orderBy']) {
    orderBy = req.query['orderBy'].split(':')[0];
    if (req.query['orderBy'].split(':')[1] && req.query['orderBy'].split(':')[1] === 'desc') {
      desc = true;
    }
    // console.log(req.query['orderBy'].split(':')[1]);
  }

  if (req.query['limit']) {
    limit = +req.query['limit'];
  }
  // console.log(orderBy);
  let courses = [];

  let sort;
  desc === true ? sort = '-' + orderBy : sort = orderBy;
  let promise;
  if (limit === 0) {
    promise = Course.find({}).sort(sort).exec();
  } else {
    promise = Course.find({}).sort(sort).limit(limit).exec();
  }

  promise.then(
    (rcourses) => {
      courses = rcourses;
      res.json(courses);
    }).catch(error => {
  });
});


courses_router.get('/:courseId/youtubeinfo', function (req, res) {
  new YoutubeVideoInfo(req.params.courseId)
  .then(instance => {
    instance.getInfo()
    .then(info => {
      // console.log(info);
      const promise = Course.findOneAndUpdate(
        { youtube_ref: req.params.courseId },
        { $set: {watched: info['viewCount']}},
        { new: true}).exec();

      promise.then(
        (course) => {
          res.json(course);
        }
      ).catch(
        (err) => {
          res.status(500).json(err);
        }
      );
    })
    .catch(err => {
      console.log(err);
    });
  });
});

module.exports = {
  courses: courses_router
};
