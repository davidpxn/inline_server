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
  });
}


async function incrementCounter(companyID) {
  const number = await incrAsync(companyID, 'counter', 1);
  return number;
}


module.exports = {
  client,
  resetRedis,
  initCompany,
  incrementCounter,
};
