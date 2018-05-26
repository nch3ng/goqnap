require('dotenv').config();
export const global = {
  dbURI: 'mongodb://' + process.env.DB_TEST_USERNAME + ':' + process.env.DB_TEST_PASSWORD + '@' + process.env.DB_TEST_ADDRESS + '/' + process.env.DB_TEST,
};
