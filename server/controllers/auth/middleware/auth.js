var jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../config')[env];

module.exports = {

  verifyToken: ( (req, res, next) => {
      let token = req.body.token || req.query.token || req.headers['x-access-token'];
    //   console.log(token);
      if( token ) {

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
  })
}