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

// Global variables
let dbURI;
let connection: mongoose.connection;
let courseController;
let authController;
let aCourseId;
// End
require('dotenv').config();
const assert = chai.assert;
chai.use(require('dirty-chai'));

const prepareData = async (done) => {
  console.log('Preparing testing');
  await mongoose.connection.dropDatabase( () => {
    const items: Course [] = require('./testdata.json');
    CourseDB.collection.insert(items, async () => {
      console.log('inserted');
      await CourseDB.findOne().limit(1).then(
        (item) => {
          aCourseId = item._id;
        }
      );
      // await authController.register({
      //   name: 'test',
      //   email: 'test@test.com',
      //   password:  '123456'}).then(
      //   (rResponse) => {
      //     token = rResponse.token;
      //   }
      // ).catch((e) => { done(e); });
      console.log('done');
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
    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      prepareData(done);
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

  it('should get all courses', () => {
    const promise = courseController.getCourses();
    return promise.then((courses: Course []) => {
      expect(courses).to.be.not.empty('all courses');
      expect(courses.length).to.equal(9);
      expect(courses[0]).to.have.property('title');
      expect(courses[0]).to.have.property('code_name');
      expect(courses[0]).to.have.property('category');
      expect(courses[0]).to.have.property('youtube_ref');
    });
  });

  it('should get youtube info of a course', () => {
    const promise = courseController.getYoutubeInfo('lDb0AwHnfHI');
    return promise.then( (course) => {
      expect(course).to.be.not.empty('course of' + course.code_name);
    });
  });

  it('should not get youtube info from wrong youtub_ref', () => {
    return courseController.getYoutubeInfo('aaa').then(
      (course) => {
        // Should not come here
      }
    ).catch(
      (err) => {
        try {
          expect(err.success).to.be.false('No youtube info');
          expect(err.message).to.be.equal('Cannot retreive the youtube info.');
        } catch (e) {
          assert(false, e.message);
        }
      }
    );
  });

  it('should get a course by Id', () => {
    return courseController.getCourse(aCourseId).then(
      (course) => {
        expect(course).to.be.not.null('a course');
      }
    ).catch(
      (err) => {
        // should not be here
      }
    );
  });

  it('should not get a course by a wrong Id', () => {
    return courseController.getCourse('wronfid').catch(
      (err) => {
        try {
          expect(err.success).to.be.false('No course info');
          expect(err.message).to.be.equal('Couldn\'t find the course.');
        } catch (e) {
          assert(false, 'should not get a course');
        }
      }
    );
  });

  it('should 4 courses by a valid search keyword \'backup\'', () => {
    return courseController.search('backup').then(
      (courses) => {
        expect(courses.length).to.be.equal(4);
      }
    ).catch(
      (err) => {
        assert(false, err.message);
      }
    );
  });

  it('should return empty by a valid search non-match keyword', () => {
    return courseController.search('dadeada@#@!#!').then(
      (courses) => {
        expect(courses).to.be.empty('searched courses');
      }
    ).catch(
      (err) => {
        // should not be here
      }
    );
  });

  it('should return empty by a empty search keyword', () => {
    return courseController.search('').then(
      (courses) => {
       expect(courses).to.be.empty('searched courses');
      }
    ).catch(
      (err) => {
        // should not be here
      }
    );
  });

  it('should return empty by a null search keyword', () => {
    return courseController.search().then(
      (courses) => {
       expect(courses).to.be.empty('searched courses');
      }
    ).catch(
      (err) => {
        // should not be here
      }
    );
  });
});
