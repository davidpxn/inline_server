/**
 * Database module for branches. Responsible for queries on the branches table.
 */

const validator = require('validator');
const xss = require('xss');

const { query } = require('../../data/db');


/**
 * Sanitize the branch's data.
 *
 * @param {object} branch - A branch.
 */
function sanitizeBranch(branch) {
  const {
    name,
  } = branch;

  Object.assign(branch, {
    name: xss(validator.escape(validator.trim(name))),
  });
}


/**
 * @param {object} branch - Object representing a new branch
 *
 * @returns {Promise} Promise representing the newly created branch
 */
async function createBranch(branch) {
  sanitizeBranch(branch);

  const q = `
  INSERT INTO 
    branches (name, company)
  VALUES 
    ($1, $2)
  RETURNING
    *`;

  const {
    name,
    company,
  } = branch;

  const result = await query(q, [name, company]);
  return result.rows[0];
}


/**
 * @param {number} branch - ID of a branch.
 * @param {number} company - ID of a company.
 *
 * @returns {Promise} - Promise saying true if the branch is a part of the company.
 */
async function branchOfCompany(branch, company) {
  const q = `
  SELECT
    *
  FROM
    branches
  WHERE
    id = $1 AND company = $2`;

  const result = await query(q, [branch, company]);
  return result.rowCount !== 0;
}


module.exports = {
  createBranch,
  branchOfCompany,
};
