require('dotenv').config();

const {
  TWILIO_SID: accountSid,
  TWILIO_TOKEN: authToken,
  TWILIO_PHONE: fromPhone,
} = process.env;

const client = require('twilio')(accountSid, authToken);


/**
 *
 * @param {string} toPhone - icelandic phone number to send sms to.
 * @param {number} number - number of user in the line.
 *
 * @returns {boolean} Indicates wether the sending was successful.
 */
async function sendSMS(toPhone, number) {
  const message = await client.messages.create({
    body: `Your number: ${number}`,
    from: fromPhone,
    to: `+354${toPhone}`,
  });

  if (message.sid) {
    return true;
  }
  return false;
}


module.exports = sendSMS;
