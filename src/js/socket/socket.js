require('dotenv').config();

const { Server } = require('http');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');

const Numbers = require('./event_handlers/numbers');


const {
  JWT_SECRET: jwtSecret,
} = process.env;


/**
 * Wrap an express app in a server that supports socket.io.
 *
 * @param {object} app - express app
 */
function initSocket(app) {
  const server = Server(app);
  const io = socketio(server);

  io.use(socketioJwt.authorize({
    secret: jwtSecret,
    handshake: true,
  }));

  io.on('connection', (socket) => {
    console.info(`Number of socket connections: ${io.engine.clientsCount}`);
    console.info('Welcome: ', socket.decoded_token.userID);

    socket.join(socket.decoded_token.companyID);

    const eventModules = [
      new Numbers(socket),
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
