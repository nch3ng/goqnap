import { Course } from './../models/course.model';
import 'mocha';
import { expect } from 'chai';
import * as chaiHttp from 'chai-http';
import CourseDB from '../models/schemas/courses.schema';

const chai = require('chai');
const server = require('../server');

chai.use(chaiHttp);

describe('API Test', () => {
  before( (done) => {
    CourseDB.remove({}, (err) => {
      const items: Course [] = require('./courses.json');

      CourseDB.collection.insert(items, () => {
        done();
      });
    });
  });
  it('/GET courses', (done) => {
    chai.request(server)
        .get('/api/courses')
        .end((err, res) => {
          const courses = res.body;
          expect(courses.length).to.be.equal(9);
          done();
        });
  });

  after( (done) => {
    CourseDB.remove({}, (err) => {
      done();
    });
  });
});
