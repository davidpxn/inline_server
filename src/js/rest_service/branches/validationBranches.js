/**
 * This module is responsible for validating branch's content.
 */


const { isValidString } = require('../../utils/validation');


/**
 * @param {object} branch - A branch
 *
 * @returns {Promise} Promise representing an array of errors in the branch's info
 */
async function validateBranch(branch) {
  const {
    name,
  } = branch;

  const errors = [];

  if (!isValidString(name, { min: 1 })) {
    errors.push({
      field: 'name',
      error: 'Branch name must not be empty',
    });
  }

  return errors;
}


module.exports = {
  validateBranch,
};
