/**
 * This module is responsible for all routing from the path /branches.
 */


const express = require('express');
const status = require('http-status-codes');

const { requireAdmin } = require('../authentication/auth');
const { catchErrorsMiddleware } = require('../../utils/utils');
const {
  findByCompany,
  createBranch,
} = require('./dbBranches');

const {
  validateBranch,
} = require('./validationBranches');

const router = express.Router();


/**
 * Route for creating a new branch.
 */
async function createBranchRoute(req, res) {
  const branch = req.body;
  branch.company = req.user.company;

  const validation = await validateBranch(branch);

  if (validation.length > 0) {
    return res.status(status.BAD_REQUEST).json(validation);
  }

  const result = await createBranch(branch);
  return res.status(status.CREATED).json(result);
}


/**
 * Route to get all branches.
 */
async function branchesRoute(req, res) {
  const {
    company,
  } = req.user;

  const rows = await findByCompany(company);

  return res.json({ rows });
}


router.get('/', requireAdmin, catchErrorsMiddleware(branchesRoute));
router.post('/', requireAdmin, catchErrorsMiddleware(createBranchRoute));

module.exports = router;
