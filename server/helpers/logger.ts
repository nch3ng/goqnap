const winston = require('winston');

const level = process.env.LOG_LEVEL || 'debug';

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: level,
      name: 'console.info',
      colorize: true,
      showLevel: true,
      timestamp: function () {
          return (new Date()).toISOString();
      },
      silent: process.env.NODE_ENV === 'testing'
    })
  ]
});


