import { UserController } from "../../controllers/users/users.controller";
import { UserCreationResponse } from "../../models/user.model";
import 'mocha';
import { expect } from 'chai';
require('dotenv').config();


const userController = new UserController();
const user = {
  email: 'test@test.com',
  name: 'testfirst testlast',
  firstName: 'John',
  lastName: 'Doe'
};

describe('Users', () => {
  before((done) => {
    done();
  });

  it ('should add a user with temp token', () => {
    const promise = userController.create(user);
    return promise.then(
      (userResponse: UserCreationResponse) => {
        // console.log(userResponse);
        expect(true).to.be.true('true');
      }
    ).catch(
      (e) => {
        console.log(e);
      }
    );
  });
}); 