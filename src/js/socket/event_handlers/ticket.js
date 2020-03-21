const status = require('http-status-codes');

const sms = require('../sms');
const {
  getTicket: rGetTicket,
  callTicket: rCallTicket,
} = require('../../data/redis');


async function getTicket(data, callback) {
  try {
    const result = await rGetTicket(this.socket.decoded_token.companyID);
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

    this.socket.to(this.socket.decoded_token.companyID).emit('/ticket/sNewTicket', result);
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
    const result = await rCallTicket(this.socket.decoded_token.companyID);

    callback({
      statusCode: status.OK,
      result,
    });

    if (result.current !== null) {
      this.socket.to(this.socket.decoded_token.companyID).emit('/ticket/sNewCall', result);
    }
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
  };
}


module.exports = Ticket;
