require('dotenv').config();
let db;
let username;
let password;
let address;
if (process.env.NODE_ENV === 'testing') {
  db = process.env.DB_TEST;
  username = process.env.DB_TEST_USERNAME;
  password = process.env.DB_TEST_PASSWORD;
  address = process.env.DB_TEST_ADDRESS;
  
} else {
  db = process.env.DB;
  username = process.env.DB_USERNAME;
  password = process.env.DB_PASSWORD;
  address = process.env.DB_ADDRESS;
}
export const global = {
  dbURI: 'mongodb://' + username + ':' + password + '@' + address + '/' + db,
};
