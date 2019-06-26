const mongoose = require('mongoose');
import { global as globalSetting } from '../global.available';

require('dotenv').config();

//tell mongoose to use es6 implementation of promises
(<any>mongoose).Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

  mongoose.connect(globalSetting.dbURI, { useNewUrlParser: true, useFindAndModify: false }); 
  mongoose.connection
    .once('open', () => {
      // console.log('Connected!');
    })
    .on('error', (error) => {
        console.warn('Error : ',error);
    });

after((done) => {
  mongoose.connection.close().then( () => done());
});