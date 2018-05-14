User = require("../../models/users");
const env = process.env.NODE_ENV || 'development';
const config = require('../../config')[env];
logger = require('../../logger');

var jwt = require('jsonwebtoken');
module.exports = function(req, res) {
  var reqUser = req.body;
  console.log("login user");
  User.findOne({'email' : reqUser.email}, (err, user) => {

    if( err )
      return done(err);

    if( !user ) {
      let content = {
        success: false,
        message: 'User does not exists'
      };
      res.send(content);
      return;
    }

    if( !user.validPassword(reqUser.password) ){
      let content = {
        success: false,
        message: 'Incorrect password'
      };
      res.send(content);
      return;
    }

    let token = jwt.sign({
      userID: user._id,
      email: user.email,
      name: user.name
    }, config.secret, {
      expiresIn : 60*60*config.expiry
    });
    let content = {
      user: user,
      success: true,
      message: 'You logged in',
      token: token
    };
    res.send(content);
  })

}