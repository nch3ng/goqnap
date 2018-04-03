/*jslint node: true */
'use strict';

import * as express from 'express';
const courses_router = express.Router();
import Course from '../../models/courses';

// import YoutubeVideoInfo from '@joegesualdo/youtube-video-info-node';


courses_router.get('/', function (req, res) {

  // console.log(req.query['orderBy']);
  let orderBy;
  let desc = false;
  if (req.query['orderBy']) {
    orderBy = req.query['orderBy'].split(':')[0];

    if (req.query['orderBy'].split(':')[1] && req.query['orderBy'].split(':')[1] === 'desc') {
      desc = true;
    }
    // console.log(req.query['orderBy'].split(':')[1]);
  }
  // console.log(orderBy);
  let courses = [];

  let sort;
  desc === true ? sort = '-' + orderBy : sort = orderBy;
  const promise = Course.find({}).sort(sort).exec();

  promise.then(
    (rcourses) => {
      courses = rcourses;
      res.json(courses);
    }).catch(error => {
  });
});
module.exports = {
  courses: courses_router
};
