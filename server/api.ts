/*jslint node: true */
'use strict';
import * as express from 'express';
const router = express.Router();
const auth = require('./controllers/auth/middleware/auth');

const registerCtrl = require('./controllers/auth/register');
const loginCtrl = require('./controllers/auth/login');
const usersCtrl = require('./controllers/users/users.controller');
const coursesCtrl = require('./controllers/courses/courses.controller');
const categoriesCtrl = require('./controllers/courses/categories.controller');
import * as migrate from './controllers/migrate.controller';

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.get('/migrate', migrate);
router.post('/register', registerCtrl);
router.post('/login', loginCtrl);
router.get('/check-state', auth.verifyToken, (req, res) => {
  const content = {
    success: true,
    message: 'Successfully logged in'
  };
  res.send(content);
});

router.use('/user', auth.verifyToken, usersCtrl.user);
router.use('/users', auth.verifyToken, usersCtrl.users);
router.use('/courses', coursesCtrl.courses);
router.use('/categories', categoriesCtrl.categories);
router.use('/category', categoriesCtrl.category);

module.exports = router;
