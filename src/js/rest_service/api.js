/**
 * This module combines all the different routers and creates the server API.
 */


const express = require('express');


/**
 * Route to show all the available API endpoints.
 */
function root(req, res) {
  return res.json({
    login: '/login',
    signup: '/signup',
  });
}


const router = express.Router();
router.get('/', root);


module.exports = router;
