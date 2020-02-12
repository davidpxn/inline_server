/**
 * This module handles all authentication of users.
 */


const express = require('express');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const { findById, findByEmail, comparePasswords } = require('../users/dbUsers');
const { catchErrors } = require('../utils');


const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = '24h',
} = process.env;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};


/**
 * Strategy function for authentication. Get the logged in user.
 */
async function strat(data, next) {
  const user = await findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}


/**
 * Middelware function to block access if user is not logged in.
 */
function requireAuth(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}


/**
 * Route to log in an user.
 */
async function loginRoute(req, res) {
  const { email, password } = req.body;

  const user = await findByEmail(email);

  if (!user) {
    return res.status(401).json({ field: 'email', error: 'No user with this email' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

    delete user.password;
    return res.json({
      token,
      expiresIn: tokenLifetime,
    });
  }

  return res.status(401).json({ field: 'password', error: 'Wrong password' });
}


const app = express();
app.use(express.json());
passport.use(new Strategy(jwtOptions, strat));
app.use(passport.initialize());

app.post('/login', catchErrors(loginRoute));


module.exports = app;
module.exports.requireAuth = requireAuth;
