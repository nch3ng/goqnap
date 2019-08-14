import * as jwt from 'jsonwebtoken';
const env = process.env.NODE_ENV || 'development';
import * as authentication from './authentication';

const auth = {
  verify: (req, res, next) => {
    authentication.expressAuthentication(req, 'JWT').then(
      (decoded) => {
        req.decoded = decoded;
        next();
      }
    ).catch(
      (error) => {
        // console.log(error);
        res.send({ success: false, message: error });
      }
    );
  }
};
module.exports = auth;
