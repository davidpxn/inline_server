/**
 * This module is responsible for validating company's content.
 */


const validator = require('validator');
const countries = require('i18n-iso-countries');

const { isValidString } = require('../utils/validation');


/**
 * @param {object} company - A company
 *
 * @returns {Promise} Promise representing an array of errors in the company's info
 */
async function validateCompany(company) {
  const {
    name,
    country,
    website,
  } = company;

  const errors = [];

  if (!isValidString(name, { min: 1 })) {
    errors.push({
      field: 'name',
      message: 'Invalid name',
    });
  }

  if (countries.getAlpha3Code(country, 'en') === undefined) {
    errors.push({
      field: 'country',
      message: 'Invalid country',
    });
  }

  if (website !== undefined && (!isValidString(website) || !validator.isURL(website))) {
    errors.push({
      field: 'website',
      message: 'Invalid website URL',
    });
  }

  return errors;
}


module.exports = {
  validateCompany,
};
