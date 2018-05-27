import { global } from './../global.available';
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';

const logger = require('../helpers/logger');

// User Bluebird promise for global promise
(<any>mongoose).Promise = Bluebird;

const env = process.env.NODE_ENV || 'development';
let gracefulShutdown;

mongoose.connect(global.dbURI, { useMongoClient: true });

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  logger.info('Mongoose connected to ' + global.dbURI);
});
mongoose.connection.on('error', function(err) {
  logger.info('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  logger.info('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    logger.info('Mongoose disconnected through ' + msg);
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
