/**
 * This module is responsible for setting up the database by
 * running all the sql scripts.
 */


require('dotenv').config();

const fs = require('fs');
const util = require('util');

const { query } = require('./data/db');
const { client: redisClient, initBranch, resetRedis } = require('./data/redis');

const databaseURL = process.env.DATABASE_URL;
const readFileAsync = util.promisify(fs.readFile);


async function main() {
  console.info(`Initializing database on ${databaseURL}`);

  // Drop tables
  try {
    const drop = await readFileAsync('./src/sql/drop.sql');

    await query(drop.toString('utf8'));

    await resetRedis();

    console.info('Tables deleted');
  } catch (e) {
    console.error('Error deleting tables: ', e.message);
    return;
  }

  // Create tables from schemas
  try {
    const tableCompany = await readFileAsync('./src/sql/companies/schema.sql');
    const tableBranch = await readFileAsync('./src/sql/branches/schema.sql');
    const tableUser = await readFileAsync('./src/sql/users/schema.sql');

    await query(tableCompany.toString('utf8'));
    await query(tableBranch.toString('utf8'));
    await query(tableUser.toString('utf8'));

    console.info('Tables created');
  } catch (e) {
    console.error('Error creating tables:', e.message);
    return;
  }

  // Insert data into tables
  try {
    const insertCompany = await readFileAsync('./src/sql/companies/insert.sql');
    const insertBranch = await readFileAsync('./src/sql/branches/insert.sql');
    const insertUser = await readFileAsync('./src/sql/users/insert.sql');

    await initBranch(1);
    await initBranch(2);
    redisClient.quit();

    await query(insertCompany.toString('utf8'));
    await query(insertBranch.toString('utf8'));
    await query(insertUser.toString('utf8'));

    console.info('Data inserted');
  } catch (e) {
    console.error('Error inserting data:', e.message);
  }
}


main().catch((err) => {
  console.error(err);
});
