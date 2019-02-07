require('dotenv').config();
let db;
let username;
let password;
let address;
let extra;
if (process.env.NODE_ENV === 'testing') {
  // for Travis
  db = process.env.DB_TEST;
  username = process.env.DB_TEST_USERNAME;
  password = process.env.DB_TEST_PASSWORD;
  address = process.env.DB_TEST_ADDRESS;
  extra = '';
} else if (process.env.NODE_ENV === 'test') {
  // for local
  db = process.env.DB_TEST;
  username = process.env.DB_TEST_USERNAME;
  password = process.env.DB_TEST_PASSWORD;
  address = process.env.DB_TEST_ADDRESS;
  extra = '?authSource=admin';
}
else {
  db = process.env.DB;
  username = process.env.DB_USERNAME;
  password = process.env.DB_PASSWORD;
  address = process.env.DB_ADDRESS;
  extra = '';
}

export const global = {
  dbURI: 'mongodb://' + username + ':' + password + '@' + address + '/' + db + extra,
};
