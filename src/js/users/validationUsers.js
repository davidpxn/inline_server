/**
 * This module is responsible for validating user's content.
 */


const validator = require('validator');

const { emailAvailable } = require('./dbUsers');
const { isValidString } = require('../utils/validation');

/**
 * @param {object} user - An user.
 *
 * @returns {Promise} Promise representing an array of errors in the user's info.
 */
async function validateUserCreate(user) {
  const {
    name,
    email,
    password,
    passwordConfirm,
  } = user;

  const errors = [];

  if (isValidString(email, { min: 1 })) {
    const isEmailAvailable = await emailAvailable(email);
    if (!isEmailAvailable) {
      errors.push({
        field: 'email',
        message: 'Email is already in use',
      });
    }

    if (!validator.isEmail(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email',
      });
    }
  } else {
    errors.push({
      field: 'email',
      message: 'Invalid email',
    });
  }

  if (!isValidString(name, { min: 1 })) {
    errors.push({
      field: 'name',
      message: 'Invalid name',
    });
  }

  if (!isValidString(password, { min: 8, trim: false })) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  }

  if (!isValidString(passwordConfirm, { min: 8, trim: false })) {
    errors.push({
      field: 'passwordConfirm',
      message: 'Password must be at least 8 characters',
    });
  }

  if (password !== passwordConfirm) {
    errors.push({
      field: 'passwordConfirm',
      message: 'Passwords do not match',
    });
  }

  return errors;
}


/**
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 *
 * @returns {Promise} Promise representing an array of errors in the user's login info.
 */
function validateUserLogin(email, password) {
  const errors = [];

  if (!isValidString(email, { min: 1 })) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  }

  if (!isValidString(password, { min: 1, trim: false })) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  }

  return errors;
}


module.exports = {
  validateUserCreate,
  validateUserLogin,
};
