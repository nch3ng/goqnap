import 'mocha';
import * as mongoose from 'mongoose';

describe('Users', () => {
  before((done) => {
    mongoose.connection.collections.users.drop(() => {
      //this function runs after the drop is completed
      //go ahead everything is done now.
      done();
    }); 
  });
});
