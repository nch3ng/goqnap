require('dotenv').config();

var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var morgan = require('morgan');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];
var port = config.port || 3000;

require('./models/db.js');
require('./config/passport.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(morgan('combined'));

var api = require('./api');
var goqnap = express.static('public');

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', api);
app.use('/', goqnap);
var static = express.static(path.join(__dirname, '../dist'));
app.use(static);
app.use(['/login', '/register'], function(req, res, next) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('/index.html', { root: path.join(__dirname, '../dist') });
});

var httpServer = http.createServer(app);

//app.use(express.static(__dirname + '../dist'));
//app.get("/register", express.static(path.join(__dirname, '../dist/register')));
console.log("Listen: " + port);
httpServer.listen(port);

if (config.ssl_enable){
  
  var credentials = {
    key: fs.readFileSync('/root/twca/qnap_com.key', 'utf8'),
    cert: fs.readFileSync('/root/twca/qnap_com.cer', 'utf8'),
    ca: fs.readFileSync("/root/twca/uca.cer", "utf8")
  };

  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(8089);

}