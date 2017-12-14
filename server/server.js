var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');

require('./models/db.js');
require('./config/passport.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var api = require('./api');
var port = process.env.PORT || 3000;


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', api);
var static = express.static(path.join(__dirname, '../dist'));
app.use(static);
app.use(['/', '/login', '/register'], function(req, res, next) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('/index.html', { root: path.join(__dirname, '../dist') });
});

//app.use(express.static(__dirname + '../dist'));
//app.get("/register", express.static(path.join(__dirname, '../dist/register')));

app.listen(port);