/**
 * This module is responsible for setting up an express server and
 * is the entry point of our app.
 */


require('dotenv').config();

const express = require('express');
const status = require('http-status-codes');
const cors = require('cors');

const api = require('./src/js/rest_service/api');
const socket = require('./src/js/socket/socket');
const auth = require('./src/js/rest_service/authentication/auth');

const {
  PORT: port = 5000,
  HOST: host = '127.0.0.1',
} = process.env;


/**
 * Function to handle reqeusts to a non-existing path.
 */
function notFoundHandler(req, res, next) { // eslint-disable-line
  console.warn('Not found', req.originalUrl);
  res.status(status.NOT_FOUND).json({ error: 'Not found' });
}


/**
 * Function to handle reqeusts that have an error.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === status.BAD_REQUEST && 'body' in err) {
    return res.status(status.BAD_REQUEST).json({ error: 'Invalid json' });
  }

  return res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
}


const app = express();

// Allow cross-origin requests
app.use(cors({
  origin: [
    'https://web-inline.herokuapp.com',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
}));

// app.get('/test', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

app.use(express.json());
app.use(auth);
app.use(api);
app.use(notFoundHandler);
app.use(errorHandler);

const server = socket(app);
server.listen(port, () => {
  if (host) {
    console.info(`Server running at http://${host}:${port}/`);
  }
});
