const { Server } = require('http');
const socketio = require('socket.io');


/**
 * Wrap an express app in a server with socket.io.
 *
 * @param {object} app - express app
 */
function initSocket(app) {
  const server = Server(app);
  const io = socketio(server);

  io.on('connection', (socket) => {
    console.info(`Number of socket connections: ${io.engine.clientsCount}`);
  });

  return server;
}


module.exports = initSocket;
