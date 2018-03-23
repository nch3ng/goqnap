/*jslint node: true */
"use strict";
var express = require('express');
var users_router = express.Router();
var user_router = express.Router();
// define the home page route

users_router.get('/', function (req, res) {
    res.send('users list');
});




user_router.get('/:userId', function (req, res) {
  res.status(200).send('get user: ' + req.params.userId);
})
module.exports = {
    users: users_router,
    user: user_router
}
