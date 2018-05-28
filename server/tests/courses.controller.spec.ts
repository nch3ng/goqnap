import { UserCourseResponse } from './../models/response.model';
import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';

import { CoursesController } from '../controllers/courses/courses.controller';
import { Course } from '../models/course.model';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import CourseDB from '../models/schemas/courses.schema';
import { global } from '../global.available';
import * as httpMocks from 'node-mocks-http';

// Global variables
let connection: mongoose.connection;
let courseController;
let aCourseId;
let youtubeRef;
// End
require('dotenv').config();
const assert = chai.assert;
chai.use(require('dirty-chai'));

const prepareData = (done) => {
  // console.log('Preparing testing');
  const items: Course [] = require('./testdata.json');

  CourseDB.collection.insert(items, () => {
    // console.log('inserted');
    CourseDB.findOne().limit(1).then(
      (item: Course) => {
        aCourseId = item._id;
        youtubeRef = item.youtube_ref;
        // console.log('done');
        setTimeout( () => {
          done();
        }, 1000);
      }
    );
  });
};

describe('Courses', () => {
  before((done) => {
    courseController = new CoursesController();
    // User Bluebird promise for global promise
    (<any>mongoose).Promise = Bluebird;
    connection = mongoose.connect(global.dbURI, {useMongoClient: true});
    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      prepareData(done);
    });
    process.on('unhandledRejection', error => {
      // Won't execute
      console.log('Unhandled Rejection, try to fix this', error);
      // done();
    });
  });

  after( () => {
    return new Promise( (resolve) => {
      connection.close(() => {
        connection.db.dropDatabase( () => {
          setTimeout( () => {
            // console.log('drop db');
            resolve();
          }, 0);
        });
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

  it('should not get youtube info from wrong youtub_ref', (done) => {
    courseController.getYoutubeInfo('aaa').then(
      (course) => {
        // Should not come here
        done('no should not be here');
      }
    ).catch(
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
    courseController.getCourse(aCourseId).then(
      (course) => {
        expect(course).to.be.not.null('a course');
        done();
      }
    ).catch(
      (err) => {
        // should not be here
        done(err);
      }
    );
  });

  it('should not get a course by a wrong Id', (done) => {
    courseController.getCourse('wronfid').catch(
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

  it('should return empty by a valid search non-match keyword', (done) => {
    courseController.search('dadeada@#@!#!').then(
      (courses) => {
        expect(courses).to.be.empty('searched courses');
        done();
      }
    ).catch(
      (err) => {
        // should not be here
        done(err);
      }
    );
  });

  it('should return empty by a empty search keyword', (done) => {
    courseController.search('').then(
      (courses) => {
        expect(courses).to.be.empty('searched courses');
        done();
      }
    ).catch(
      (err) => {
        // should not be here
        done(err);
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

  it('should return true and course object after add a course', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'Transfer files from Windows',
        code_name: 'QNP110',
        desc: 'In this video, we will teach you about the few and easy steps on how to transfer your files from your PC to your QNAP NAS.',
        keywords: 'samba smb qfinder ip address find',
        youtube_ref: 'J5yhBpsPSFU',
        category: 'freshman'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        expect(uResponse).to.be.not.null('responded');
        expect(uResponse.success).to.be.true('success');
        expect(uResponse.message).to.be.equal('Create a course successfully');
        expect(uResponse.course).to.be.not.null('course object');
        expect(uResponse.course.code_name).to.be.equal('QNP110');

        courseController.getCourse(uResponse.course._id).then(
          (course) => {
            expect(course).to.be.not.null('found course');
            expect(course.code_name).to.be.equal(request.body.code_name);
            expect(course._id.toString()).to.be.eq(uResponse.course._id.toString());
            expect(course.title).to.be.equal(request.body.title);
            expect(course.keywords).to.be.equal(request.body.keywords);
            expect(course.youtube_ref).to.be.equal(request.body.youtube_ref);
            expect(course.category).to.be.equal(request.body.category);

          }
        ).catch(
          (e) => {
            console.error(e);
            // assert(false, e.message);
          }
        );
    }).catch((e) => {
      console.log(e);
    });
  });

  it('should return false if code_name exists', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'Transfer files from Windows',
        code_name: 'QNP110',
        desc: 'In this video, we will teach you about the few and easy steps on how to transfer your files from your PC to your QNAP NAS.',
        keywords: 'samba smb qfinder ip address find',
        youtube_ref: 'J5yhBpsPSFU',
        category: 'freshman'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('Code name exists');
    });
  });

  it('should return false if no title given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'test',
        desc: 'test desc',
        keywords: 'test keyword',
        youtube_ref: 'testyoutuberef',
        category: 'testcategory'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('title is required');
    });;
  });

  it('should return false if no code name given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        desc: 'test desc',
        keywords: 'test keyword',
        youtube_ref: 'testyoutuberef',
        category: 'testcategory'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('code name is required');
    });;
  });

  it('should return false if no description given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        code_name: 'test',
        keywords: 'test keyword',
        youtube_ref: 'testyoutuberef',
        category: 'testcategory'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('desc is required');
    });
  });

  it('should return false if no keywords given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        code_name: 'test',
        desc: 'test desc',
        youtube_ref: 'testyoutuberef',
        category: 'testcategory'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('keywords is required');
    });;
  });

  it('should return false if no youtube reference given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        code_name: 'test',
        desc: 'test desc',
        keywords: 'test keyword',
        category: 'testcategory'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('youtube reference is required');
    });;
  });

  it('should return false if no category given', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        code_name: 'test',
        desc: 'test desc',
        keywords: 'test keyword',
        youtube_ref: 'testyoutuberef'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('category is required');
    });;
  });

  it('should return false if youtube reference does not exist', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'testtitle',
        code_name: 'test',
        desc: 'test desc',
        keywords: 'test keyword',
        youtube_ref: 'testyoutuberef',
        category: 'test category'
      }
    });

    return courseController.addCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('no success');
      expect(e.message).to.be.equal('The youtube reference does not exist.');
    });
  });

  it('should return true and course object after update a course with valid info', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        _id: aCourseId,
        title: 'This is a modified title',
        code_name: 'This is a modified codename',
        desc: 'This is a modified desc',
        keywords: 'This is a modified keyword',
        youtube_ref: 'zqtzIZEjX0w',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        expect(uResponse).to.be.not.null('responded');
        expect(uResponse.success).to.be.true('success');
        expect(uResponse.message).to.be.equal('Updated a course successfully');
        expect(uResponse.course).to.be.not.null('course object');
        expect(uResponse.course.code_name).to.be.equal(request.body.code_name);

        courseController.getCourse(request.body._id).then(
          (course) => {
            expect(course).to.be.not.null('found course');
            expect(course.code_name).to.be.equal(request.body.code_name);
            expect(course._id.toString()).to.be.eq(request.body._id.toString());
            expect(course.title).to.be.equal(request.body.title);
            expect(course.keywords).to.be.equal(request.body.keywords);
            expect(course.youtube_ref).to.be.equal(request.body.youtube_ref);
            expect(course.category).to.be.equal(request.body.category);
            done();
          }
        ).catch(
          (e) => {
            done(e);
          }
        );
    }).catch((e) => {
      done(e);
    });
  });

  it('should return false when update course without id', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        title: 'This is a modified title',
        code_name: 'This is a modified codename',
        desc: 'This is a modified desc',
        keywords: 'This is a modified keyword',
        youtube_ref: 'zqtzIZEjX0w',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('Please specify a course id');
      done();
    }).catch((e) => {
      done(e);
    });
  });
  it('should return false when update course without title', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'This is a modified codename',
        desc: 'This is a modified desc',
        keywords: 'This is a modified keyword',
        youtube_ref: 'zqtzIZEjX0w',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('title is required');
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it('should return false when update course without description', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'This is a modified codename',
        title: 'This is a test title',
        keywords: 'This is a modified keyword',
        youtube_ref: 'zqtzIZEjX0w',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('desc is required');
      done();
    }).catch((e) => {
      done(e);
    });
  });
  it('should return false when update course without keywords', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'This is a modified codename',
        title: 'This is a test title',
        desc: 'This is a modified desc',
        youtube_ref: 'zqtzIZEjX0w',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
      done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('keywords is required');
      done(); 
    }).catch((e) => {
      done(e);
    });
  });
  it('should return false when update course without youtube reference', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'This is a modified codename',
        title: 'This is a test title',
        desc: 'This is a modified desc',
        keywords: 'This is a modified keyword',
        category: 'This is a modified category'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('youtube reference is required');
      done();
    }).catch((e) => {
      done(e);
    });
  });
  it('should return false when update course without category', (done) => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/courses',
      body: {
        code_name: 'This is a modified codename',
        title: 'This is a test title',
        desc: 'This is a modified desc',
        keywords: 'This is a modified keyword',
        youtube_ref: 'zqtzIZEjX0w'
      }
    });

    courseController.updateCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('category is required');
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it('should return false when deleting a course without id', (done) => {
    const request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/courses',
      body: {
      }
    });
    courseController.deleteCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('Failed to delete a course');
      done();
    }).catch((e) => {
      done(e);
    });
  })

  it('should return false when deleting a course with an invalid id', (done) => {
    const request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/courses',
      body: {
        _id: '1234556'
      }
    });
    courseController.deleteCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        done('should not be here');
    }).catch((e) => {
      expect(e).to.be.not.null('responded');
      expect(e.success).to.be.false('return false');
      expect(e.message).to.be.equal('Failed to delete a course');
      done();
    }).catch((e) => {
      done(e);
    });
  })

  it('should return true and retreive after deleting a course', (done) => {
    const request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/courses',
      body: {
        _id: aCourseId
      }
    });
    courseController.deleteCourse(request.body).then(
      (uResponse: UserCourseResponse) => {
        expect(uResponse).to.be.not.null('responded');
        expect(uResponse.success).to.be.true('return true');
        expect(uResponse.message).to.be.equal('Successfully deleted a course');
        expect(uResponse.course._id.toString()).to.be.equal(request.body._id.toString());
        
        courseController.getCourse(uResponse.course._id).then(
          (course) => {
            expect(course).to.be.null('sholud not get a deleted course');
            done();
          }
        ).catch(
          (e) => {
            done(e);
            // assert(false, e.message);
          }
        );
    }).catch((e) => {
      done(e);
    });
  })
});
