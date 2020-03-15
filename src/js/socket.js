require('dotenv').config();

const { Server } = require('http');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');

const sms = require('./sms');
const { incrementCounter } = require('./redis');


const {
  JWT_SECRET: jwtSecret,
} = process.env;


/**
 * Wrap an express app in a server with socket.io.
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

    socket.on('test/number', async (data) => {
      const number = await incrementCounter(socket.decoded_token.companyID);
      const success = await sms(data.phone, number);

      if (!success) {
        await sms(data.phone, number);
      }
    });
  });

  return server;
}


module.exports = initSocket;
