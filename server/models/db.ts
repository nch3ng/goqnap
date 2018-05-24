import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';

// User Bluebird promise for global promise
(<any>mongoose).Promise = Bluebird;

const env = process.env.NODE_ENV || 'development';
let gracefulShutdown;
const dbURI = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSSWORD + '@' + process.env.DB_ADDRESS + '/' + process.env.DB;

mongoose.connect(dbURI, { useMongoClient: true });

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app termination', function() {
    process.exit(0);
  });
});
