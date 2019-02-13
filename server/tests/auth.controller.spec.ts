import { UserLoginResponse, UserRegisterResponse, AuthResponseError } from './../models/user.model';
import { AuthController } from './../controllers/auth/auth.controller';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';
import * as httpMocks from 'node-mocks-http';
import { UserRegisterRequest, User } from '../models/user.model';
import 'mocha';
import { expect, assert } from 'chai';
import * as chai from 'chai';
import { expressAuthentication } from '../controllers/auth/middleware/authentication';
import { global } from '../global.available';
chai.use(require('dirty-chai'));
require('dotenv').config();

// User Bluebird promise for global promise
(<any>mongoose).Promise = Bluebird;

let token = null;

const authController = new AuthController();
let connection: mongoose.connection;
describe('Authentication', () => {
  before((done) => {
    connection = mongoose.connect(global.dbURI, {useMongoClient: true});
    connection.on('error', console.error.bind(console, 'connection error'));
    connection.once('open', function() {
      setTimeout( () => done(), 0);
    });
  });

  after( () => {
    return new Promise( (resolve) => {
      connection.db.dropDatabase( () => {
        connection.db.close( () => {
          setTimeout( () => {
            resolve();
          }, 0);
        })          
      });
    });
  });

  it('should return user info when register a valid user', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/signup',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        password:  '123456'
      }
    });
    return authController.register(request.body).then(
      (rResponse: UserRegisterResponse) => {
        token = rResponse.token;
        expect(token).to.be.not.null('returned token');
        // console.log(token);
      }
    ).catch((e) => {
    });
  });

  it('should return user when login with a valid user email', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/login',
      body: {
        email: 'test@test.com',
        password: '123456'
      }
    });
    return authController.login(request.body, null).then( (uResponse: UserLoginResponse) => {
      expect(uResponse).to.be.not.null('user exists');
      expect(uResponse.message).to.be.equal('You are logged in.');
      expect(uResponse.token).to.be.exist('token');
      expect(uResponse.payload).to.be.not.null('user object');
      expect(uResponse.payload.email).to.be.equal('test@test.com');
      expect(uResponse.payload.firstName).to.be.equal('John');
      expect(uResponse.payload.lastName).to.be.equal('Doe');
      expect(uResponse.payload.name).to.be.equal('John Doe');
      token = uResponse.token;
    });
  });

  it ('should change password if pass with valid password', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/change-password',
      body: {
        email: 'test@test.com',
        oldPassword: '123456',
        password: '1234'
      }
    });
    return authController.changePassword(request.body).then((uResponse: UserLoginResponse) => {
      expect(uResponse).to.be.not.null('user exists');
      expect(uResponse.success).to.be.true('Changed password');
      expect(uResponse.message).to.be.equal('Successfully changed password');

      const loginRequest = httpMocks.createRequest({
        method: 'GET',
        url: '/login',
        body: {
          email: 'test@test.com',
          password: '1234'
        }
      });
      return authController.login(loginRequest.body).then( (loginResponse: UserLoginResponse) => {
        expect(loginResponse).to.be.not.null('user exists');
        expect(loginResponse.message).to.be.equal('You are logged in.');
        expect(loginResponse.token).to.be.exist('token');
        expect(loginResponse.payload).to.be.not.null('user object');
        expect(loginResponse.payload.email).to.be.equal('test@test.com');
        expect(loginResponse.payload.name).to.be.equal('John Doe');
        token = loginResponse.token;
      });
    })
  });
  it ('should not change password if pass with invalid password', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/change-password',
      body: {
        email: 'test@test.com',
        password: '1256',
        oldPassword: '1213131'
      }
    });
    return authController.changePassword(request.body).then((uResponse: UserLoginResponse) => { 
    }).catch((e) => {
      expect(e.success).to.be.false('Password incorrect');
      expect(e.message).to.be.equal('Incorrect password');
    });
  });

  it('should fail when login with a non-existed email', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/login',
      body: {
        email: 'test11@test.com',
        password: '12345689'
      }
    });
    return authController.login({
      email: 'test11@test.com',
      password: '12345689'
    }, null).then( (uResponse: UserLoginResponse) => {
      // Expect not here
      assert(false, 'should not login');
    }).catch((e) => {
      expect(e.success).to.be.false('responded');
      expect(e.message).to.be.equal('User does not exist');
    });
  });
  it('should fail when login with an wrong password', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/login',
      body: {
        email: 'test@test.com',
        password: '12345689'
      }
    });
    return authController.login(request.body, null).then( (uResponse: UserLoginResponse) => {
      // Expect not here
      assert(false, 'should not login');
    }).catch((e) => {
      expect(e.success).to.be.false('responded');
      expect(e.message).to.be.equal('Incorrect password');
    });
  });

  it('should fail when login register with an existed user email', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/signup',
      body: {
        name: 'test',
        email: 'test@test.com',
        password:  '123456'
      }
    });
    return authController.register(request.body).then( (uResponse: UserRegisterResponse) => {
      // Expect not here
      assert(false, 'should not login');
    }).catch((e) => {
      expect(e.success).to.be.false('responded');
      expect(e.message).to.be.equal('Email exists');
    });
  });

  it('should pass with a valid token', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/test/path',
      headers: {
        'x-access-token': token
      }
    });
    const response = httpMocks.createResponse();

    return expressAuthentication(request, 'JWT').then(
      (uResponse: UserLoginResponse) => {
        expect(uResponse).to.be.not.null('responded');
        expect(uResponse.message).to.be.equal('You are authorized');
      });
  });
  it('should not pass without token', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/test/path',
      headers: {
        'x-access-token': ''
      }
    });
    const response = httpMocks.createResponse();

    return expressAuthentication(request, 'JWT').then(
      (uResponse: UserLoginResponse) => {
        // Expect not to be here
        assert(false, 'should not access');
      }).catch((e: AuthResponseError) => {
        expect(e.success).to.be.false('responded');
        expect(e.message).to.be.equal('No token provided');
      });
  });

  it('should not pass with a malformed token', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/test/path',
      headers: {
        'x-access-token': 'wrongtoken'
      }
    });
    const response = httpMocks.createResponse();

    return expressAuthentication(request, 'JWT').then(
      (uResponse: UserLoginResponse) => {
        // Expect not to be here
        assert(false, 'should not access');
      }).catch((e: AuthResponseError) => {
        expect(e.success).to.be.false('responded');
        expect(e.message).to.be.equal('jwt malformed');
      });
  });
});
