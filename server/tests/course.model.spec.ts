import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import CourseDB from '../models/schemas/courses';

chai.use(require('dirty-chai'));
let c;
describe('Course schema', () => {
  before(() => {
    (<any>mongoose).Promise = Bluebird;
    c = new CourseDB();
  });
  it('should be invalid if code name is empty', function(done) {
    c.validate((err) => {
        expect(err.errors.code_name).to.exist('code name');
        done();
    });
  });
});
