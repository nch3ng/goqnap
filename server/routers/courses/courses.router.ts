/*jslint node: true */

import { Get, Route, Request } from 'tsoa';
import * as express from 'express';
const courses_router = express.Router();
import CourseDB from '../../models/schemas/courses';
import * as auth from '../../controllers/auth/middleware/auth';
import { CoursesController } from '../../controllers/courses/courses.controller';
import * as YouTube from 'youtube-node';
import { Course } from './../../models/course.model';

courses_router.get('/', function (req, res) {

  let limit = 0;

  if (req.query['limit']) {
    limit = +req.query['limit'];
  }


  const courseCtrl = new CoursesController();
  courseCtrl.getCourses(limit, req.query['orderBy']).then(
    (res_courses) => {
      console.log('Test controller.');
      res.json(res_courses);
    }
  ).catch(
    (errors) => {
      console.log(errors);
    }
  );
});

// Must place before get coure by courseId
courses_router.get('/search', function (req, res) {
  const queryStr = req.query['query'];
  // console.log('search ' + queryStr);
  if (queryStr) {
    const promise = CourseDB.find({$text: {$search: queryStr}}).exec();
    promise.then(
      (courses) => {
        // console.log(courses);
        res.json(courses);
      }
    ).catch(
      (err) => {
        res.status(200).json([]);
      }
    );
  } else {
    res.status(200).json([]);
  }
});

courses_router.get('/:courseId', function (req, res) {
  console.log('Get course: ' + req.params.courseId);
  const course = new CoursesController();
  course.getCourse(req.params.courseId).then(
    (res_course) => {
      res.json(res_course);
    }).catch(error => {
      res.status(500).json({
        success: false,
        message: error
      });
  });
});

courses_router.get('/category/:name/courses', function (req, res) {
  const promise = CourseDB.find({'category': req.params.name}).exec();

  promise.then(
    (courses) => {
      res.status(200).json(courses);
    }
  ).catch(
    (err) => {
      res.status(500);
    }
  );
});

courses_router.get('/:youtubeRef/youtubeinfo', function (req, res) {
  const youTube = new YouTube();

  youTube.setKey(process.env.YOUTUBE_KEY);

  youTube.getById(req.params.youtubeRef, function(error, info) {
    if (error) {
      res.status(500).json(error);
    } else {
      const item = info.items[0];
      // console.log(item);
      const promise = CourseDB.findOneAndUpdate(
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

  youTube.setKey(process.env.YOUTUBE_KEY);

  youTube.getById(req.params.youtubeRef, function(error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(JSON.stringify(result, null, 2));
      res.status(200).json(result);
    }
  });
});

courses_router.post('/', auth.verifyToken, (req, res) => {
  const course = new CourseDB();
  Object.assign(course, req.body);
  course.save(function (err) {
    if (err) {
      res.status(500).json(
        {
          success: false,
          message: 'Create a course failed',
          reason: err
        }
      );
    }

    const youTube = new YouTube();

    youTube.setKey(process.env.YOUTUBE_KEY);

    youTube.getById(course.youtube_ref, function(error, info) {
      if (error) {
        res.status(500).json({
                success: false,
                message: 'The youtube reference does not exist.',
                reason: error
        });
      } else {
        const item = info.items[0];
        const promise = CourseDB.findOneAndUpdate(
                { youtube_ref: course.youtube_ref },
                { $set: {
                    duration: item.contentDetails.duration,
                    like: item.statistics.likeCount,
                    dislike: item.statistics.dislikeCount,
                    watched: item.statistics.viewCount,
                    favoriteCount: item.statistics.favoriteCount,
                    commentCount: item.statistics.commentCount,
                    publishedDate: item.snippet.publishedAt
                  }
                },
                { new: true}).exec();
        promise.then(
          (rCourse) => {
            res.status(200).json({
              success: true,
              message: 'Create a course successfully',
              course: rCourse
            });
          }
        ).catch(
          (rError) => {
            res.status(500).json({
              success: false,
              message: 'Can not update video with youtube information',
              reason: rError
            });
          }
        );
      }
    });
    // saved!
  });
});

courses_router.put('/', auth.verifyToken, (req, res) => {
  const course = new Course();
  Object.assign(course, req.body);

  // console.log(course);
  // console.log(req.body);
  const course_promise = CourseDB.findOneAndUpdate({_id: course._id}, {$set: {
    title: course.title,
    code_name: course.code_name,
    keywords: course.keywords,
    desc: course.desc,
    youtube_ref: course.youtube_ref,
    category: course.category }}, { new: true}).exec();

  course_promise.then((updated_course) => {
    // console.log(updated_course);

    const youTube = new YouTube();

    youTube.setKey(process.env.YOUTUBE_KEY);

    youTube.getById(updated_course.youtube_ref, function(error, info) {
      if (error) {
        res.status(500).json({
                success: false,
                message: 'The youtube reference does not exist.',
                reason: error
        });
      } else {
        const item = info.items[0];
        const promise = CourseDB.findOneAndUpdate(
                { youtube_ref: updated_course.youtube_ref },
                { $set: {
                    duration: item.contentDetails.duration,
                    like: item.statistics.likeCount,
                    dislike: item.statistics.dislikeCount,
                    watched: item.statistics.viewCount,
                    favoriteCount: item.statistics.favoriteCount,
                    commentCount: item.statistics.commentCount,
                    publishedDate: item.snippet.publishedAt
                  }
                },
                { new: true}).exec();
        promise.then(
          (rCourse) => {
            res.status(200).json({
              success: true,
              message: 'Create a course successfully',
              course: rCourse
            });
          }
        ).catch(
          (rError) => {
            res.status(500).json({
              success: false,
              message: 'Can not update video with youtube information',
              reason: rError
            });
          }
        );
      }
    });
  }).catch(
    (err) => {
      res.status(500).json({
        success: false,
        message: 'Cannot find the course to update',
        reason: err
      });
    }
  );
    // saved!
});
courses_router.delete('/:courseId', auth.verifyToken, (req, res) => {
  const promise = CourseDB.findOneAndRemove({ _id: req.params.courseId}).exec();

  promise.then(
    (user) => {
      res.status(200).json(user);
    },
    (err) => {
      res.status(500).json({
        success: false,
        message: 'Delete a course failed',
        reason: err
      });
      throw err;
    }
  );
});

// courses_router.get('/:category/search', function (req, res) {
//   const queryStr = req.query['query'];
//   console.log('search ' + queryStr);
//   if (queryStr) {
//     const promise = Course.find({$text: {$search: queryStr}}).exec();
//     promise.then(
//       (courses) => {
//         // console.log(courses);
//         res.json(courses);
//       }
//     ).catch(
//       (err) => {
//         res.status(500).json(err);
//       }
//     );
//   } else {
//     res.status(500).json({
//       message: 'Please enter a query string.'
//     });
//   }
// });

module.exports = {
  courses: courses_router
};