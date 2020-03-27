/**
 * This module is responsible for all routing from the path /users.
 */


const express = require('express');
const status = require('http-status-codes');

const { requireMinManager } = require('../authentication/auth');
const { catchErrorsMiddleware } = require('../../utils/utils');
const {
  findByCompany,
  findByBranch,
  createUser,
} = require('./dbUsers');

const {
  validateUserCreate,
} = require('./validationUsers');

const router = express.Router();


/**
 * Route for creating a new user.
 */
async function createUserRoute(req, res) {
  const user = req.body;
  user.company = req.user.company;

  const validation = await validateUserCreate(user, req.user);

  if (validation.length > 0) {
    return res.status(status.BAD_REQUEST).json(validation);
  }

  const result = await createUser(user);
  return res.status(status.CREATED).json(result);
}


/**
 * Route to get all users.
 */
async function usersRoute(req, res) {
  const {
    company,
    branch,
    role,
  } = req.user;

  let rows;

  switch (role) {
    case 'admin':
      rows = await findByCompany(company);
      break;
    case 'manager':
      rows = await findByBranch(branch);
      break;
    default:
      rows = [];
  }

  return res.json({ rows });
}


router.get('/', requireMinManager, catchErrorsMiddleware(usersRoute));
router.post('/', requireMinManager, catchErrorsMiddleware(createUserRoute));

module.exports = router;
