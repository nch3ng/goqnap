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
var usersCtrl = require("./controllers/users/users.controller");
var coursesCtrl = require("./controllers/courses/courses.controller");
var categoriesCtrl = require("./controllers/courses/categories.controller");

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

router.use('/user', auth.verifyToken, usersCtrl.user);
router.use('/users', auth.verifyToken, usersCtrl.users);
router.use('/courses', coursesCtrl.courses);
router.use('/categories', categoriesCtrl.categories);
router.use('/category', categoriesCtrl.category);

module.exports = router;