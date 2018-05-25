// eslint-disable-next-line no-unused-expressions
import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import { Course } from '../../models/course.model';
import { ICourse } from '../../models/interfaces/course.interface';
import CourseDB from '../../models/schemas/courses';
import { CoursesController } from './courses.controller';

require('dotenv').config();

let dbURI;
let connection: mongoose.connection;
let courseController;
let aCourseId;
const assert = chai.assert;
chai.use(require('dirty-chai'));

const prepareData = async (done): Promise<any> => {

  await mongoose.connection.dropDatabase( () => {
    const items: Course [] = require('../..//tests/testdata.json');
    for (const item of items) {
      CourseDB.create(item, (err, saved_item) => {
        // assert.isNull(err, 'Prepare data failed.');
        console.log(saved_item._id + ' has been created.');
        aCourseId = saved_item._id;
      });
    }
  });

  setTimeout( () => { done(); }, 1000);
};

describe('Courses Test', () => {
  before((done) => {
    courseController = new CoursesController();
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
});
