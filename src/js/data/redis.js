require('dotenv').config();

const redis = require('redis');
const { promisify } = require('util');


const {
  REDIS_URL: redisUrl = 'redis://127.0.0.1:6379',
} = process.env;

const client = redis.createClient({ url: redisUrl });

const getAsync = promisify(client.hgetall).bind(client);
const setAsync = promisify(client.hmset).bind(client);
const incrAsync = promisify(client.hincrby).bind(client);
const flushallAsync = promisify(client.flushall).bind(client);

client.on('error', (error) => {
  console.error(error);
});


async function resetRedis() {
  await flushallAsync();
}


async function initBranch(branchID) {
  await setAsync(branchID, {
    counter: 0,
    current: 0,
    waiting: 0,
  });
}


async function getBranchState(branchID) {
  const state = await getAsync(branchID);
  return state;
}


async function getTicket(branchID) {
  const waiting = await incrAsync(branchID, 'waiting', 1);
  const number = await incrAsync(branchID, 'counter', 1);

  return {
    number,
    waiting,
  };
}


async function callTicket(branchID) {
  let waiting = await incrAsync(branchID, 'waiting', -1);

  if (waiting < 0) {
    waiting = await incrAsync(branchID, 'waiting', -waiting);

    return {
      current: null,
      waiting,
      next: null,
    };
  }

  const current = await incrAsync(branchID, 'current', 1);

  return {
    current,
    waiting,
    next: waiting === 0 ? null : current + 1,
  };
}


module.exports = {
  client,
  resetRedis,
  initBranch,
  getTicket,
  callTicket,
  getBranchState,
};
