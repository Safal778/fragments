const passport = require('passport');
const httpAuth = require('http-auth');
const hash = require('../hash');
const logger = require('../logger');
const { createErrorResponse } = require('../response');

const authenticate = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user) => {
    if (err) {
      logger.error({ err, strategy }, 'Unexpected authentication error');
      return next(err);
    }

    if (!user) {
      logger.warn({ strategy }, 'Authentication rejected');
      return res.status(401).json(createErrorResponse(401, 'unauthorized'));
    }

    const email = typeof user === 'string' ? user : user.email;
    if (!email) {
      logger.error({ strategy }, 'Authenticated user did not include an email');
      return next(new Error('authenticated user is missing an email'));
    }

    req.user = hash(email);
    logger.debug({ strategy, user: req.user }, 'Authentication succeeded');
    return next();
  })(req, res, next);
};

authenticate.basic = (options) => httpAuth.basic(options);

module.exports = authenticate;
