require('dotenv').config();

const redis = require('redis');
const { promisify } = require('util');


const {
  REDIS: redisUrl = 'redis://127.0.0.1:6379',
} = process.env;

const client = redis.createClient({ url: redisUrl });

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const incrAsync = promisify(client.incr).bind(client);
const flushallAsync = promisify(client.flushall).bind(client);

client.on('error', (error) => {
  console.error(error);
});


async function resetRedis() {
  await flushallAsync();
}


async function initCompany(companyID) {
  await setAsync(companyID, 0);
}


async function incrementCounter(companyID) {
  const number = await incrAsync(companyID);
  return number;
}


module.exports = {
  client,
  resetRedis,
  initCompany,
  incrementCounter,
};
