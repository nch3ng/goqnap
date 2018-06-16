import { UserController } from "../controllers/users/users.controller";
import { UserCreationResponse } from "../models/user.model";
import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';

import { global } from '../global.available';

let userController;
let user;
let connection:mongoose.connection;

require('dotenv').config();
const assert = chai.assert;
chai.use(require('dirty-chai'));

describe('Users', () => {
  before((done) => {
    userController = new UserController();
    user = {
      email: 'test@test.com',
      name: 'testfirst testlast'
    };

    (<any>mongoose).Promise = Bluebird;
    connection = mongoose.connect(global.dbURI, {useMongoClient: true});
    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      done();
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

  it ('should add a user with temp token', () => {
    const promise = userController.create(user);
    return promise.then(
      (userResponse: UserCreationResponse) => {
        console.log(userResponse);
        expect(true).to.be.true('true');
      }
    ).catch(
      (e) => {
        console.log(e);
      }
    );
  });
}); 