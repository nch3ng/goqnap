/*jslint node: true */
'use strict';
import * as express from 'express';
const router = express.Router();
const auth = require('./controllers/auth/middleware/auth');

const registerCtrl = require('./routers/auth/register.router');
const loginCtrl = require('./routers/auth/login.router');
const usersRouter = require('./routers/users/users.router');
const coursesRouter = require('./routers/courses/courses.router');
const categoriesCtrl = require('./routers/courses/categories.router');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.post('/register', registerCtrl);
router.post('/login', loginCtrl);
router.get('/check-state', auth.verifyToken, (req, res) => {
  const content = {
    success: true,
    message: 'Successfully logged in'
  };
  res.send(content);
});

router.use('/user', auth.verifyToken, usersRouter.user);
router.use('/users', auth.verifyToken, usersRouter.users);
router.use('/courses', coursesRouter.courses);
router.use('/categories', categoriesCtrl.categories);
router.use('/category', categoriesCtrl.category);

module.exports = router;
