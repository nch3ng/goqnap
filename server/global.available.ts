require('dotenv').config();
export const global = {
  dbURI: 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_ADDRESS + '/' + process.env.DB,
};
