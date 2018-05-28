import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';

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

describe('Categories', () => {
  before( () => {

  });
});
