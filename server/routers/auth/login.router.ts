import UserDB from '../../models/schemas/users';
const env = process.env.NODE_ENV || 'development';
const config = require('../../config')[env];
// logger = require('../../logger');

import { AuthController } from '../../controllers/auth/login';
import { UserLoginResponse } from '../../models/user.model';

module.exports = function(req, res) {
  console.log('login user');
  new AuthController().login(req.body).then(
    (response: UserLoginResponse) => {
      res.json(response);
    }
  ).catch(
    (error) => {
      res.json(error);
    }
  );
};
