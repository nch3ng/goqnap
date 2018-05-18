import * as jwt from 'jsonwebtoken';
const env = process.env.NODE_ENV || 'development';
const config = require('../../../config')[env];
import * as authentication from './authentication';

const auth = {
  verifyToken: ( (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    // console.log(req.headers);
    // console.log(token);
    if (token) {

        jwt.verify(token, config.secret, (err, decoded) => {
          if (err) {
            return res.json({ success: false, message: err });
          } else {
              // all good, continue
            req.decoded = decoded;
            next();
          }
        });

    }  else {
      res.send({ success: false, message: 'No token exists.' });
    }
  }),
  verify: (req, res, next) => {
    authentication.expressAuthentication(req, 'jwt').then(
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