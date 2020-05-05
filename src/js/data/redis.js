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
    done: 0,
    skipped: 0,
  });
}


function formatTicket(ticket) {
  return `000${ticket}`.substr(-3);
}

async function getBranchState(branchID) {
  const state = await getAsync(branchID);
  state.current = formatTicket(state.current);

  if (state.waiting > 0) {
    state.next = formatTicket(parseInt(state.current, 10) + 1);
  }

  return state;
}


async function getTicket(branchID) {
  const waiting = await incrAsync(branchID, 'waiting', 1);
  const number = await incrAsync(branchID, 'counter', 1);

  const result = {
    number: formatTicket(number),
    waiting,
  };

  if (waiting === 1) {
    result.next = formatTicket(number);
  }
  return result;
}


async function callTicket(branchID, finishedTicket) {
  const waiting = await incrAsync(branchID, 'waiting', -1);

  const result = {
    current: null,
    waiting,
    next: null,
  };

  if (finishedTicket) {
    result.done = await incrAsync(branchID, 'done', 1);
  }
  if (waiting < 0) {
    result.waiting = await incrAsync(branchID, 'waiting', -waiting);
    return result;
  }

  const current = await incrAsync(branchID, 'current', 1);
  result.current = formatTicket(current);
  result.next = waiting === 0 ? null : formatTicket(current + 1);

  return result;
}


async function finishTicket(branchID, finishedTicket) {
  const done = await incrAsync(branchID, 'done', 1);

  return {
    done,
    finishedTicket,
  };
}


async function skipTicket(branchID, skippedTicket) {
  const skipped = await incrAsync(branchID, 'skipped', 1);

  return {
    skipped,
    skippedTicket,
  };
}


module.exports = {
  client,
  resetRedis,
  initBranch,
  getTicket,
  callTicket,
  getBranchState,
  finishTicket,
  skipTicket,
};
