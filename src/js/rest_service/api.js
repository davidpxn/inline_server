/**
 * This module combines all the different routers and creates the server API.
 */


const express = require('express');

const usersRouter = require('./users/routerUsers');
const branchesRouter = require('./branches/routerBranches');


/**
 * Route to show all the available API endpoints.
 */
function root(req, res) {
  return res.send('Welcome to the backend of inline');
}


const router = express.Router();
router.get('/', root);
router.use('/users', usersRouter);
router.use('/branches', branchesRouter);

module.exports = router;
