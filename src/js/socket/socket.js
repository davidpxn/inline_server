require('dotenv').config();

const { Server } = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const redisAdapter = require('socket.io-redis');
const cookieParser = require('cookie');

const Ticket = require('./event_handlers/ticket');


const {
  JWT_SECRET: jwtSecret,
  HEROKU_REDIS_CYAN_URL: redisUrl = 'redis://127.0.0.1:6379',
  NODE_ENV: nodeEnv = 'development',
} = process.env;


function verifyJWT(token, socket, next) {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    socket.token = decoded; // eslint-disable-line
    next();
  } catch (err) {
    next(err);
  }
}


/**
 * Wrap an express app in a server that supports socket.io.
 *
 * @param {object} app - express app
 */
function initSocket(app) {
  const server = Server(app);
  const io = socketio(server);
  io.adapter(redisAdapter(redisUrl));


  io.use((socket, next) => {
    const { jwtheader } = socket.handshake.headers;
    const jwtcookie = cookieParser.parse(socket.handshake.headers.cookie).jwt;

    if (nodeEnv === 'production') {
      verifyJWT(jwtcookie, socket, next);
    }

    if (nodeEnv === 'development') {
      verifyJWT(jwtcookie || jwtheader, socket, next);
    }
  });


  io.on('connection', (socket) => {
    console.info(`Number of socket connections: ${io.engine.clientsCount}`);
    console.info('Welcome: ', socket.token.userID);

    socket.join(socket.token.branchID);

    const eventModules = [
      new Ticket(socket),
    ];

    // eslint-disable-next-line
    for (const module of eventModules) {
      // eslint-disable-next-line
      for (const [name, handler] of Object.entries(module.handlers)) {
        socket.on(name, handler);
      }
    }
  });

  return server;
}


module.exports = initSocket;
