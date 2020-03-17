const status = require('http-status-codes');

const sms = require('../sms');
const { incrementCounter } = require('../../data/redis');


async function requestNumber(data, callback) {
  try {
    const number = await incrementCounter(this.socket.decoded_token.companyID);
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
  } catch (err) {
    console.error(err);

    callback({
      statusCode: status.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
}


function Numbers(socket) {
  this.socket = socket;

  this.handlers = {
    '/requestNumber': requestNumber.bind(this),
  };
}


module.exports = Numbers;
