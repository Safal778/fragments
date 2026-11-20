const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');
const logger = require('../logger');

const router = express.Router();

router.use('/v1', authenticate(), require('./api'));

router.get('/', (req, res) => {
  logger.debug('Health check requested');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(
    createSuccessResponse({
      description: 'fragments service running',
      author,
      githubUrl: 'https://github.com/Safal778/fragments',
      version,
      timestamp: new Date().toISOString(),
    })
  );
});

module.exports = router;
