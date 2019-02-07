require('dotenv').config();

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';
import * as morgan from 'morgan';
// import * as cookieParser from 'cookie-parser';
// Controllers for tsoa routes
import './controllers/courses/courses.controller';
import './controllers/courses/categories.controller';
import './controllers/auth/middleware/authentication';
import './controllers/auth/auth.controller';
import './controllers/users/users.controller';
import './controllers/keywords.controller';
import './controllers/roles/roles.controller';
import './controllers/tags/tag.controller';
import './controllers/comments/comment.controller';
import './controllers/comments/comments.controller'
// End of Controllers
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './helpers/error.handler';

const logger = require('./helpers/logger');
const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.port || 3000;
console.log("STARTING....");

require('./models/db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

if (process.env.NODE_ENV !== 'testing') {
  app.use(morgan('combined'));
}

const goqnap = express.static('public');

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.debug('Time: ', Date.now());
  next();
});


app.use('/', goqnap);
const static_dist = express.static(path.join(__dirname, '../dist'));
app.use(static_dist);

// Auto-generated routes by tsoa
RegisterRoutes(app);
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(errorHandler);

const httpServer = http.createServer(app);
logger.info('CORS-enabled for all origins.  Listen: ' + port);
httpServer.listen(port);

if (process.env.ssl_enable && env == 'production') {
  const ssl_port = process.env.ssl_port || 9000;
  const credentials = {
    key: fs.readFileSync('/root/twca/qnap_com.key', 'utf8'),
    cert: fs.readFileSync('/root/twca/qnap_com.cer', 'utf8'),
    ca: fs.readFileSync('/root/twca/uca.cer', 'utf8')
  };

  const httpsServer = https.createServer(credentials, app);
  logger.info('CORS-enabled for all origins.  Listen: ' + ssl_port);
  httpsServer.listen(ssl_port);

}

module.exports = app;
