/**
 * This module is responsible for setting up an express server and
 * is the entry point of our app.
 */


require('dotenv').config();

const express = require('express');

const api = require('./src/js/api');
const socket = require('./src/js/socket');
const auth = require('./src/js/authentication/auth');

const {
  PORT: port = 5000,
  HOST: host = '127.0.0.1',
} = process.env;


/**
 * Function to handle reqeusts to a non-existing path.
 */
function notFoundHandler(req, res, next) { // eslint-disable-line
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
}


/**
 * Function to handle reqeusts that have an error.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}


const app = express();

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  next();
});

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
