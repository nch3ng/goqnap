/*jslint node: true */
'use strict';

import * as express from 'express';
const courses_router = express.Router();
import Course from '../../models/courses';

import * as YouTube from 'youtube-node';

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


courses_router.get('/:youtubeRef/youtubeinfo', function (req, res) {
  const youTube = new YouTube();

  youTube.setKey('AIzaSyCAgrmyG2Z01Zls0wqlaG772rmEKwHnkic');

  youTube.getById(req.params.youtubeRef, function(error, info) {
    if (error) {
      res.status(500).json(error);
    } else {
      const item = info.items[0];
      // console.log(item.contentDetails);
      // console.log(item.contentDetails.statistics);
      // console.log(JSON.stringify(result, null, 2));
      const promise = Course.findOneAndUpdate(
              { youtube_ref: req.params.youtubeRef },
              { $set: {
                  duration: item.contentDetails.duration,
                  like: item.statistics.likeCount,
                  dislike: item.statistics.dislikeCount,
                  watched: item.statistics.viewCount,
                  favoriteCount: item.statistics.favoriteCount,
                  commentCount: item.statistics.commentCount
                }
              },
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
    }
  });
});

courses_router.get('/:youtubeRef/youtubemeta', function (req, res) {
  const youTube = new YouTube();

  youTube.setKey('AIzaSyCAgrmyG2Z01Zls0wqlaG772rmEKwHnkic');

  youTube.getById(req.params.youtubeRef, function(error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(JSON.stringify(result, null, 2));
      res.status(200).json(result);
    }
  });
});


module.exports = {
  courses: courses_router
};
