// eslint-disable-next-line no-unused-expressions
import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import { Course } from '../../models/course.model';
import { ICourse } from '../../models/interfaces/course.interface';
import CourseDB from '../../models/schemas/courses';
import { CoursesController } from './courses.controller';

require('dotenv').config();
let dbURI;
let connection: mongoose.connection;
let courseController;
const assert = chai.assert;
chai.use(require('dirty-chai'));

describe('Courses Test', () => {
  before((done) => {
    courseController = new CoursesController();
    // User Bluebird promise for global promise
    (<any>mongoose).Promise = Bluebird;
    dbURI = 'mongodb://' + process.env.DB_TEST_USERNAME + ':' + process.env.DB_TEST_PASSWORD + '@' + process.env.DB_TEST_ADDRESS + '/' + process.env.DB_TEST;
    connection = mongoose.connect(dbURI, {useMongoClient: true});

    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      console.log('We are connected to test database!');
      done();
    });
    process.on('unhandledRejection', error => {
      // Won't execute
      console.log('unhandledRejection', error.test);
      done();
    });
  });

  after( (done) => {
    connection.close(function () {
      done();
    });
  });

  it('should get all courses', (done) => {
    const promise = courseController.getCourses();
    promise.then((courses: Course []) => {
      expect(courses).to.be.not.empty('all courses');
      done();
    }).catch(
      (err) => {
        done(err);
    });
    // done();
  });
    // const result = new CoursesController().getCourses().then(
    //   (courses: Course []) => {
    //     console.log(courses);
    // });
});
