/*jslint node: true */
'use strict';

import * as express from 'express';
const courses_router = express.Router();
const Course = require('../../models/courses');

import * as admin from 'firebase-admin';
const serviceAccount = require('./striped-reserve-853-firebase-adminsdk-rsa37-eba2a0f172.json');

courses_router.get('/', function (req, res) {
  console.log('get courses');
  let courses = [];
  const promise = Course.find({}).exec();

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
