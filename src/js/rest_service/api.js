/**
 * This module combines all the different routers and creates the server API.
 */


const express = require('express');

const usersRouter = require('./users/routerUsers');


/**
 * Route to show all the available API endpoints.
 */
function root(req, res) {
  return res.json({
    login: '/login',
    signup: '/signup',
    users: {
      users: '/users',
      create: '/users/create',
    },
  });
}


const router = express.Router();
router.get('/', root);
router.use('/users', usersRouter);

module.exports = router;
