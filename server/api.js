var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var auth = require("./controllers/auth/middleware/auth");
// var auth = jwt({
//   secret: '/mfA3uWl+1wKxpWn+TKRQyA67tgxQ60NAhv3WbqJK3M=',
//   userProperty: 'payload'
// });



var registerCtrl = require("./controllers/auth/register");
var loginCtrl = require("./controllers/auth/login");
var userCtrl = require("./controllers/users/user.controller");
var usersCtrl = require("./controllers/users/users.controller");

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
});


router.post('/register', registerCtrl);
router.post('/login', loginCtrl);
router.get('/check-state', auth.verifyToken, (req, res) => {
  let content = {
    success: true,
    message: 'Successfully logged in'
  }
  res.send(content);
});

router.use('/user', auth.verifyToken, userCtrl);
router.use('/users', auth.verifyToken, usersCtrl);

module.exports = router;