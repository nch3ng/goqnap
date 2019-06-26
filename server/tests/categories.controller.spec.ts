import 'mocha';
import * as mongoose from 'mongoose';

describe('Categories', () => {
  before((done) => {
    mongoose.connection.collections.categories.drop(() => {
      //this function runs after the drop is completed
      //go ahead everything is done now.
      done();
    }); 
  });
});
