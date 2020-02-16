/**
 * This module handles all authentication of users.
 */


const express = require('express');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const {
  findById,
  findByEmail,
  comparePasswords,
  createUser,
} = require('../users/dbUsers');
const { createCompany } = require('../companies/dbCompanies');
const { validateUserCreate, validateUserLogin } = require('../users/validationUsers');
const { validateCompany } = require('../companies/validationCompanies');
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

  const validation = validateUserLogin(email, password);

  if (validation.length > 0 || validation.length > 0) {
    return res.status(400).json({ errors: validation });
  }

  const user = await findByEmail(email);
  if (!user) {
    return res.status(401).json({ field: 'email', error: 'No user with this email' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

    return res.json({
      token,
      expiresIn: tokenLifetime,
    });
  }

  return res.status(401).json({ field: 'password', error: 'Wrong password' });
}


/**
 * Route to sign up for a new company.
 */
async function signupRoute(req, res) {
  const { user = {}, company = {} } = req.body;

  const validationUser = await validateUserCreate(user);
  const validationCompany = await validateCompany(company);

  if (validationUser.length > 0 || validationCompany.length > 0) {
    return res.status(400).json({
      errors: {
        user: validationUser,
        company: validationCompany,
      },
    });
  }

  const resultCompany = await createCompany(company);
  Object.assign(user, { company: resultCompany.id, role: 'admin' });
  const resultUser = await createUser(user);

  return res.status(201).json({ user: resultUser, company: resultCompany });
}


const app = express();
app.use(express.json());
passport.use(new Strategy(jwtOptions, strat));
app.use(passport.initialize());

app.post('/login', catchErrors(loginRoute));
app.post('/signup', catchErrors(signupRoute));

module.exports = app;
module.exports.requireAuth = requireAuth;
