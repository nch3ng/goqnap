require('dotenv').config();

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';

import * as morgan from 'morgan';

import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';

const app = express();
const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];
const port = config.port || 3000;

require('./models/db.js');
require('./config/passport.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(morgan('combined'));

const api = require('./api');
const goqnap = express.static('public');

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', api);
app.use('/', goqnap);
const static_dist = express.static(path.join(__dirname, '../dist'));
app.use(static_dist);
// app.use(['/login', '/register'], function(req, res, next) {
//   // Just send the index.html for other files to support HTML5Mode
//   res.sendFile('/index.html', { root: path.join(__dirname, '../dist') });
// });

const httpServer = http.createServer(app);

// app.use(express.static(__dirname + '../dist'));
// app.get("/register", express.static(path.join(__dirname, '../dist/register')));
console.log('CORS-enabled for all origins.  Listen: ' + port);
httpServer.listen(port);

if (config.ssl_enable) {
  const ssl_port = config.ssl_port || 9000;
  const credentials = {
    key: fs.readFileSync('/root/twca/qnap_com.key', 'utf8'),
    cert: fs.readFileSync('/root/twca/qnap_com.cer', 'utf8'),
    ca: fs.readFileSync('/root/twca/uca.cer', 'utf8')
  };

  const httpsServer = https.createServer(credentials, app);
  console.log('CORS-enabled for all origins.  Listen: ' + ssl_port);
  httpsServer.listen(ssl_port);

}
