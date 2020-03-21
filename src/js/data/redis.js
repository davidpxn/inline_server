require('dotenv').config();

const redis = require('redis');
const { promisify } = require('util');


const {
  REDIS: redisUrl = 'redis://127.0.0.1:6379',
} = process.env;

const client = redis.createClient({ url: redisUrl });

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.hmset).bind(client);
const incrAsync = promisify(client.hincrby).bind(client);
const flushallAsync = promisify(client.flushall).bind(client);

client.on('error', (error) => {
  console.error(error);
});


async function resetRedis() {
  await flushallAsync();
}


async function initCompany(companyID) {
  await setAsync(companyID, {
    counter: 0,
    current: 0,
    waiting: 0,
  });
}


async function getTicket(companyID) {
  const waiting = await incrAsync(companyID, 'waiting', 1);
  const number = await incrAsync(companyID, 'counter', 1);

  return {
    number,
    waiting,
  };
}


async function callTicket(companyID) {
  let waiting = await incrAsync(companyID, 'waiting', -1);

  if (waiting < 0) {
    waiting = await incrAsync(companyID, 'waiting', -waiting);

    return {
      current: null,
      waiting,
      next: null,
    };
  }

  const current = await incrAsync(companyID, 'current', 1);

  return {
    current,
    waiting,
    next: waiting === 0 ? null : current + 1,
  };
}


module.exports = {
  client,
  resetRedis,
  initCompany,
  getTicket,
  callTicket,
};
