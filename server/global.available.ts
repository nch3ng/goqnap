require('dotenv').config();
const secrets = require('./run/secrets');
let db;
let username;
let password;
let address;
let extra;
let protocol;
if (process.env.NODE_ENV === 'testing') {
  // for Travis
  db = process.env.DB_TEST;
  username = process.env.DB_TEST_USERNAME;
  password = process.env.DB_TEST_PASSWORD;
  address = process.env.DB_TEST_ADDRESS;
  extra = '';
} else if (process.env.NODE_ENV === 'test') {
  // for local
  db = process.env.DB_LOCAL_TEST;
  protocol = process.env.DB_PROTOCOL;
  username = process.env.DB_LOCAL_TEST_USERNAME;
  password = process.env.DB_LOCAL_TEST_PASSWORD;
  address = process.env.DB_LOCAL_TEST_ADDRESS;
  extra = '?authSource=admin';
} else if (process.env.NODE_ENV === 'development') {
  db = process.env.DB;
  protocol = process.env.DB_PROTOCOL;
  username = process.env.DB_USERNAME;
  password = process.env.DB_PASSWORD;
  address = process.env.DB_ADDRESS;
  extra = '?authSource=admin';
} else if (process.env.NODE_ENV === 'staging') {
    db = process.env.DB;
    protocol = process.env.DB_PROTOCOL;
    username = process.env.DB_USERNAME;
    password = process.env.DB_PASSWORD;
    address = process.env.DB_ADDRESS;
    extra = '?authSource=admin';
} else {
  protocol = process.env.DB_PROTOCOL;
  db = process.env.DB;
  username = process.env.DB_USERNAME;
  password = process.env.DB_PASSWORD;
  address = process.env.DB_ADDRESS;
  // extra = '?authSource=admin';
  // extra = '';
}

export const global = {
  dbURI: protocol + '://' + username + ':' + password + '@' + address + '/' + db + extra,
};
