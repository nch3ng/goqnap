import { Course } from './../models/course.model';
import { global } from './global.available';
import { AuthController } from './../controllers/auth/auth.controller';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import CourseDB from '../models/schemas/courses';

require('dotenv').config();
// User Bluebird promise for global promise
(<any>mongoose).Promise = Bluebird;

const authController = new AuthController();
let connection: mongoose.connection;
describe('Auth', () => {
  before((done) => {

    connection = mongoose.connect(global.dbURI, {useMongoClient: true});

    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      done();
    });
    mongoose.connection.dropDatabase( () => {
    });
  });

  after( (done) => {
    console.log('auth after');
    connection.close(() => {
      connection.db.dropDatabase( () => {
        done();
      });
    });
  });

  it('should return user info when register a valid user', (done) => {
    authController.register({
      name: 'test',
      email: 'test@test.com',
      password:  '123456'}).then(
      (rResponse) => {
        console.log(rResponse);
        done();
      }
    ).catch((e) => { done(e); });
  });
});
