const winston = require('winston');

const level = process.env.LOG_LEVEL || 'debug';

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: level,
      timestamp: function () {
          return (new Date()).toISOString();
      }
    })
  ]
});


