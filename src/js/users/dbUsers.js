/**
 * Database module for users. Responsible for queries on the "users" table.
 */


const bcrypt = require('bcrypt');
const validator = require('validator');
const xss = require('xss');

const { query } = require('../data/db');

const {
  BCRYPT_ROUNDS: bcryptRounds = 10,
} = process.env;


/**
 * Sanitizes the user's data.
 *
 * @param {object} user - An user.
 */
function sanitizeUser(user) {
  const {
    name,
    email,
  } = user;

  Object.assign(user, {
    name: xss(validator.escape(validator.trim(name))),
    email: xss(validator.normalizeEmail(validator.escape(validator.trim(email)))),
  });
}


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
    WHERE
      id = $1`;

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
      *
    FROM
      users
    WHERE
      email = $1`;

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


/**
 * @param {string} email - User's email.
 *
 * @returns {Promise} - Promise saying true if the email is available.
 */
async function emailAvailable(email) {
  const q = `
  SELECT
    *
  FROM
    users
  WHERE
    email = $1`;

  const result = await query(q, [email]);
  return result.rowCount === 0;
}


/**
 * @param {object} user - Object representing a new user
 *
 * @returns {Promise} Promise representing the newly created user
 */
async function createUser(user) {
  sanitizeUser(user);

  const {
    name,
    email,
    password,
    company,
    role,
  } = user;

  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const q = `
    INSERT INTO
      users (name, email, password, company, role)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id, name, email, company, role, created, updated`;

  const result = await query(q, [name, email, hashedPassword, company, role]);
  return result.rows[0];
}


module.exports = {
  findById,
  findByEmail,
  comparePasswords,
  emailAvailable,
  createUser,
};
