/**
 * Database module for users. Responsible for queries on the "users" table.
 */


const bcrypt = require('bcrypt');

const { query } = require('../db');

const {
  BCRYPT_ROUNDS: bcryptRounds = 10,
} = process.env;


/**
 * @param {number} id - User's id.
 *
 * @returns {Promise} Promise representing the requested user.
 */
async function findById(id) {
  const q = `
    SELECT
      id, name, email, company, role, created, updated
    FROM
      users
    WHERE id = $1`;

  const result = await query(q, [id]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}


/**
 * @param {string} email - User's email.
 *
 * @returns {Promise} Promise representing the requested user.
 */
async function findByEmail(email) {
  const q = `
    SELECT
      id, name, email, company, role, created, updated
    FROM
      users
    WHERE email = $1`;

  const result = await query(q, [email]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}


/**
 * @param {string} password - Raw password.
 * @param {string} hash - Hashed password.
 *
 * @returns {Promise} Promise saying true if the password and hash match.
 */
async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}


module.exports = {
  findById,
  findByEmail,
  comparePasswords,
};
