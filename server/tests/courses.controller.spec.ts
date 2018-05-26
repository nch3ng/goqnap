import { AuthController } from '../controllers/auth/auth.controller';
import { CoursesController } from '../controllers/courses/courses.controller';
import { Course } from '../models/course.model';
import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import CourseDB from '../models/schemas/courses';

require('dotenv').config();

// Global variables
let dbURI;
let connection: mongoose.connection;
let courseController;
let authController;
let aCourseId;
let token;
// End

const assert = chai.assert;
chai.use(require('dirty-chai'));

const prepareData = async (done) => {
  console.log('Preparing testing');
  await mongoose.connection.dropDatabase( () => {
    const items: Course [] = require('./testdata.json');
    CourseDB.collection.insert(items, async () => {
      await CourseDB.findOne().limit(1).then(
        (item) => {
          aCourseId = item._id;
        }
      );
      await authController.register({
        name: 'test',
        email: 'test@test.com',
        password:  '123456'}).then(
        (rResponse) => {
          token = rResponse.token;
        }
      ).catch((e) => { done(e); });
      done();
    });
  });
};

describe('Courses', () => {
  before((done) => {
    courseController = new CoursesController();
    authController = new AuthController();
    // User Bluebird promise for global promise
    (<any>mongoose).Promise = Bluebird;
    dbURI = 'mongodb://' + process.env.DB_TEST_USERNAME + ':' + process.env.DB_TEST_PASSWORD + '@' + process.env.DB_TEST_ADDRESS + '/' + process.env.DB_TEST;
    connection = mongoose.connect(dbURI, {useMongoClient: true});
    prepareData(done);
    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      // done();
    });
    process.on('unhandledRejection', error => {
      // Won't execute
      console.log('unhandledRejection', error.test);
      done();
    });
  });

  after( (done) => {
    connection.close(() => {
      connection.db.dropDatabase( () => {
        done();
      });
    });
  });

  it('should get all courses', (done) => {
    const promise = courseController.getCourses();
    promise.then((courses: Course []) => {
      expect(courses).to.be.not.empty('all courses');
      expect(courses.length).to.equal(9);
      expect(courses[0]).to.have.property('title');
      expect(courses[0]).to.have.property('code_name');
      expect(courses[0]).to.have.property('category');
      expect(courses[0]).to.have.property('youtube_ref');
      done();
    }).catch(
      (err) => {
        done(err);
    });
  });

  it('should get youtube info of a course', (done) => {
    const promise = courseController.getYoutubeInfo('lDb0AwHnfHI');
    promise.then( (course) => {
      expect(course).to.be.not.empty('course of' + course.code_name);
      done();
    }).catch(
      (err) => {
        done(err);
      }
    );
  });

  it('should not get youtube info from wrong youtub_ref', (done) => {
    const promise = courseController.getYoutubeInfo('aaa');
    promise.catch(
      (err) => {
        try {
          expect(err.success).to.be.false('No youtube info');
          expect(err.message).to.be.equal('Cannot retreive the youtube info.');
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });

  it('should get a course by Id', (done) => {
    const promise = courseController.getCourse(aCourseId);
    promise.then(
      (course) => {
        expect(course).to.be.not.null('a course');
        done();
      }
    ).catch(
      (err) => {
        done(err);
      }
    );
  });

  it('should not get a course by a wrong Id', (done) => {
    const promise = courseController.getCourse('wronfid');
    promise.catch(
      (err) => {
        try {
          expect(err.success).to.be.false('No course info');
          expect(err.message).to.be.equal('Couldn\'t find the course.');
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });

  it('should 4 courses by a valid search keyword \'backup\'', (done) => {
    const promise = courseController.search('backup');
    promise.then(
      (courses) => {
       expect(courses.length).to.be.equal(4);
       done();
      }
    ).catch(
      (err) => {
        done(err);
      }
    );
  });

  it('should return empty by a valid search non-match keyword', (done) => {
    const promise = courseController.search('dadeada@#@!#!');
    promise.then(
      (courses) => {
       expect(courses).to.be.empty('searched courses');
       done();
      }
    ).catch(
      (err) => {
        done(err);
      }
    );
  });

  it('should return empty by a empty search keyword', (done) => {
    const promise = courseController.search('');
    promise.then(
      (courses) => {
       expect(courses).to.be.empty('searched courses');
       done();
      }
    ).catch(
      (err) => {
        done(err);
      }
    );
  });

  it('should return empty by a null search keyword', (done) => {
    const promise = courseController.search();
    promise.then(
      (courses) => {
       expect(courses).to.be.empty('searched courses');
       done();
      }
    ).catch(
      (err) => {
        done(err);
      }
    );
  });
});
