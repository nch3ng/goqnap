import 'mocha';
import * as mongoose from 'mongoose';


// const userController = new UserController();
// const user = {
//   email: 'test@test.com',
//   name: 'testfirst testlast',
//   firstName: 'John',
//   lastName: 'Doe'
// };

describe('Users', () => {
  before((done) => {
    mongoose.connection.collections.users.drop(() => {
      done();
    }); 
  });

  // it ('should add a user with temp token', () => {
  //   const promise = userController.create(user);
  //   return promise.then(
  //     (userResponse: UserCreationResponse) => {
  //       // console.log(userResponse);
  //       expect(true).to.be.true('true');
  //     }
  //   ).catch(
  //     (e) => {
  //       console.log(e);
  //     }
  //   );
  // });
}); 