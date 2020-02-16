/**
 * Database module for companies. Responsible for queries on the companies table.
 */

const validator = require('validator');
const xss = require('xss');

const { query } = require('../db');


/**
 * Sanitizes the company's data.
 *
 * @param {object} company - A company.
 */
function sanitizeCompany(company) {
  const {
    name,
    website,
  } = company;

  Object.assign(company, {
    name: xss(validator.escape(validator.trim(name))),
    website: website ? xss(validator.escape(validator.trim(website))) : null,
  });
}


/**
 * @param {object} company - Object representing a new compnay
 *
 * @returns {Promise} Promise representing the newly created company
 */
async function createCompany(company) {
  sanitizeCompany(company);

  const q = `
  INSERT INTO 
    companies (name, country, website)
  VALUES 
    ($1, $2, $3)
  RETURNING
    *`;

  const {
    name,
    country,
    website,
  } = company;

  const result = await query(q, [name, country, website]);
  return result.rows[0];
}


module.exports = {
  createCompany,
};
