/**
 * Database module for users. Responsible for queries on the "users" table.
 */


const bcrypt = require('bcrypt');
const validator = require('validator');
const xss = require('xss');

const { query } = require('../../data/db');

const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS, 10);


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
 * @param {number} companyID - ID of a company.
 *
 * @returns {Promise} Promise representing all users from the company.
 */
async function findByCompany(companyID) {
  const q = `
    SELECT
      id, name, email, company, branch, role, created, updated
    FROM
      users
    WHERE
      company = $1`;

  const result = await query(q, [companyID]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows;
}


/**
 * @param {number} branchID - ID of a branch.
 *
 * @returns {Promise} Promise representing all users from the branch.
 */
async function findByBranch(branchID) {
  const q = `
    SELECT
      id, name, email, company, branch, role, created, updated
    FROM
      users
    WHERE
      branch = $1`;

  const result = await query(q, [branchID]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows;
}


/**
 * @param {number} id - User's id.
 *
 * @returns {Promise} Promise representing the requested user.
 */
async function findById(id) {
  const q = `
    SELECT
      id, name, email, company, branch, role, created, updated
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
 * @param {number} id - User's id.
 *
 * @returns {Promise} Promise representing the requested user with company and branch info.
 */
async function findByIdExtra(id) {
  const q = `
    SELECT
      users.id AS "userID", 
      users.name, 
      users.email, 
      users.company AS "companyID", 
      companies.name AS "companyName",
      users.branch AS "branchID", 
      branches.name AS "branchName",
      users.role, 
      users.created, 
      users.updated
    FROM
      users, companies, branches
    WHERE
      users.id = $1 AND
      users.company = companies.id AND
      users.branch = branches.id`;

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
    branch,
    role,
  } = user;

  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const q = `
    INSERT INTO
      users (name, email, password, company, branch, role)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING
      id, name, email, company, branch, role, created, updated`;

  const result = await query(q, [name, email, hashedPassword, company, branch, role]);
  return result.rows[0];
}


module.exports = {
  findByCompany,
  findByBranch,
  findById,
  findByEmail,
  comparePasswords,
  emailAvailable,
  createUser,
  findByIdExtra,
};
