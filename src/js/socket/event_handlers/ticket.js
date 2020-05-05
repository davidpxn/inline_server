const status = require('http-status-codes');

const sms = require('../sms');
const {
  getTicket: rGetTicket,
  callTicket: rCallTicket,
  finishTicket: rFinishTicket,
  skipTicket: rSkipTicket,
} = require('../../data/redis');


async function getTicket(data, callback) {
  try {
    const result = await rGetTicket(this.socket.token.branchID);
    const { number } = result;

    let success = await sms(data.phone, number);

    if (!success) {
      success = await sms(data.phone, number);

      if (!success) {
        throw new Error('Error sending SMS');
      }
    }

    callback({
      statusCode: status.OK,
      number,
    });

    this.socket.to(this.socket.token.branchID).emit('/ticket/sNewTicket', result);
  } catch (err) {
    console.error(err);

    callback({
      statusCode: status.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
}


async function callNext(data, callback) {
  try {
    const result = await rCallTicket(this.socket.token.branchID, data.finishedTicket);

    callback({
      statusCode: status.OK,
      result,
    });

    if (result.current !== null) {
      this.socket.to(this.socket.token.branchID).emit('/ticket/sNewCall', result);
    }
  } catch (err) {
    console.error(err);

    callback({
      statusCode: status.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
}


async function finishTicket(data, callback) {
  try {
    const result = await rFinishTicket(this.socket.token.branchID, data.finishedTicket);

    callback({
      statusCode: status.OK,
      result,
    });
    this.socket.to(this.socket.token.branchID).emit('/ticket/sFinishedTicket', result);
  } catch (err) {
    console.error(err);

    callback({
      statusCode: status.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
}


async function skipTicket(data, callback) {
  try {
    const result = await rSkipTicket(this.socket.token.branchID, data.skippedTicket);

    callback({
      statusCode: status.OK,
      result,
    });
    this.socket.to(this.socket.token.branchID).emit('/ticket/sSkippedTicket', result);
  } catch (err) {
    console.error(err);

    callback({
      statusCode: status.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
}


function Ticket(socket) {
  this.socket = socket;

  this.handlers = {
    '/ticket/cGetTicket': getTicket.bind(this),
    '/ticket/cCallNext': callNext.bind(this),
    '/ticket/cFinishTicket': finishTicket.bind(this),
    '/ticket/cSkipTicket': skipTicket.bind(this),
  };
}


module.exports = Ticket;
