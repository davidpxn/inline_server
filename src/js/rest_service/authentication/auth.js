/**
 * This module handles all authentication of users.
 */


const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const status = require('http-status-codes');

const {
  findById,
  findByEmail,
  comparePasswords,
  createUser,
} = require('../users/dbUsers');

const { createCompany } = require('../companies/dbCompanies');
const { createBranch } = require('../branches/dbBranches');

const { validateUserCreate, validateUserLogin } = require('../users/validationUsers');
const { validateCompany } = require('../companies/validationCompanies');
const { validateBranch } = require('../branches/validationBranches');

const { catchErrorsMiddleware } = require('../../utils/utils');
const { initBranch } = require('../../data/redis');


const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = '24h',
} = process.env;

const jwtOptions = {
  jwtFromRequest: (req) => req.cookies.jwt,
  secretOrKey: jwtSecret,
};


/**
 * Strategy function for authentication. Get the logged in user.
 */
async function strat(data, next) {
  const user = await findById(data.userID);
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
          ? 'Expired token' : 'Invalid token';

        return res.status(status.UNAUTHORIZED).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}


/**
 * Middelware function to block access if user is not at least a manager.
 */
function requireMinManager(req, res, next) {
  if (req.user.role === 'agent') {
    return res.status(status.FORBIDDEN).json({ error: 'Forbidden' });
  }

  return next();
}


/**
 * Middelware function to block access if user is not admin.
 */
function requireAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }

  return res.status(status.FORBIDDEN).json({ error: 'Forbidden' });
}


function setCookie(res, payload) {
  const tokenOptions = { expiresIn: tokenLifetime };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  res.cookie('jwt', token, { httpOnly: true, secure: true });
}


/**
 * Route to log in an user.
 */
async function loginRoute(req, res) {
  const { email, password } = req.body;

  const validation = validateUserLogin(email, password);

  if (validation.length > 0 || validation.length > 0) {
    return res.status(status.BAD_REQUEST).json({ errors: validation });
  }

  const user = await findByEmail(email);
  if (!user) {
    return res.status(status.UNAUTHORIZED).json({ field: 'email', error: 'No user with this email' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { userID: user.id, companyID: user.company, branchID: user.branch };
    setCookie(res, payload);
    return res.send('Login successful');
  }

  return res.status(status.UNAUTHORIZED).json({ field: 'password', error: 'Wrong password' });
}


/**
 * Route to sign up for a new company.
 */
async function signupRoute(req, res) {
  const { user = {}, company = {}, branch = {} } = req.body;

  const validationUser = await validateUserCreate(user);
  const validationCompany = await validateCompany(company);
  const validationBranch = await validateBranch(branch);

  if (validationUser.length > 0 || validationCompany.length > 0 || validationBranch.length > 0) {
    return res.status(status.BAD_REQUEST).json({
      errors: {
        user: validationUser,
        company: validationCompany,
        branch: validationBranch,
      },
    });
  }

  const resultCompany = await createCompany(company);

  Object.assign(branch, { company: resultCompany.id });
  const resultBranch = await createBranch(branch);
  await initBranch(resultBranch.id);

  Object.assign(user, { company: resultCompany.id, branch: resultBranch.id, role: 'admin' });
  const resultUser = await createUser(user);

  const payload = {
    userID: resultUser.id,
    companyID: resultUser.company,
    branchID: resultUser.branch,
  };
  setCookie(res, payload);

  return res.status(status.CREATED).json({
    user: resultUser,
    company: resultCompany,
    branch: resultBranch,
  });
}


const app = express();
app.use(express.json());
app.use(cookieParser());
passport.use(new Strategy(jwtOptions, strat));
app.use(passport.initialize());

app.post('/login', catchErrorsMiddleware(loginRoute));
app.post('/signup', catchErrorsMiddleware(signupRoute));

module.exports = app;
module.exports.requireAuth = requireAuth;
module.exports.requireMinManager = [requireAuth, requireMinManager];
module.exports.requireAdmin = [requireAuth, requireAdmin];
