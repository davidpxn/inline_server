/**
 * This module is responsible for validating user's content.
 */


const validator = require('validator');

const { emailAvailable } = require('./dbUsers');
const { branchOfCompany } = require('../branches/dbBranches');
const { isValidString } = require('../../utils/validation');

const roles = ['admin', 'manager', 'agent'];


/**
 * @param {object} user - A new user to create.
 * @param {object} creator - Optional. The user initiating the creation.
 *
 * @returns {Promise} Promise representing an array of errors in the user's info.
 */
async function validateUserCreate(user, creator) {
  const {
    name,
    email,
    password,
    passwordConfirm,
    branch,
    role,
  } = user;

  const errors = [];

  if (creator) {
    switch (creator.role) {
      case 'admin':
        if (!Number.isInteger(branch) || !(await branchOfCompany(branch, creator.company))) {
          errors.push({
            field: 'branch',
            error: 'Invalid branch',
          });
        }
        if (!roles.includes(role)) {
          errors.push({
            field: 'role',
            error: 'Role must be admin, manager or agent',
          });
        }
        break;
      case 'manager':
        if (branch !== creator.branch) {
          errors.push({
            field: 'branch',
            error: 'Managers are only allowed to create users for their branch',
          });
        }
        if (!roles.slice(1, 3).includes(role)) {
          errors.push({
            field: 'role',
            error: 'Role must be manager or agent',
          });
        }
        break;
      default:
        break;
    }
  }

  if (isValidString(email, { min: 1 })) {
    const isEmailAvailable = await emailAvailable(email);
    if (!isEmailAvailable) {
      errors.push({
        field: 'email',
        error: 'Email is already in use',
      });
    }

    if (!validator.isEmail(email)) {
      errors.push({
        field: 'email',
        error: 'Invalid email',
      });
    }
  } else {
    errors.push({
      field: 'email',
      error: 'Invalid email',
    });
  }

  if (!isValidString(name, { min: 1 })) {
    errors.push({
      field: 'name',
      error: 'Invalid name',
    });
  }

  if (!isValidString(password, { min: 8, trim: false })) {
    errors.push({
      field: 'password',
      error: 'Password must be at least 8 characters',
    });
  }

  if (!isValidString(passwordConfirm, { min: 8, trim: false })) {
    errors.push({
      field: 'passwordConfirm',
      error: 'Password must be at least 8 characters',
    });
  }

  if (password !== passwordConfirm) {
    errors.push({
      field: 'passwordConfirm',
      error: 'Passwords do not match',
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
      error: 'Email is required',
    });
  }

  if (!isValidString(password, { min: 1, trim: false })) {
    errors.push({
      field: 'password',
      error: 'Password is required',
    });
  }

  return errors;
}


module.exports = {
  validateUserCreate,
  validateUserLogin,
};
