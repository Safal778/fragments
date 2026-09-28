// src/routes/index.js

const express = require('express');

const { version, author } = require('../../package.json');

const router = express.Router();
const { authenticate } = require('../auth');
router.use(`/v1`, authenticate(), require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    description: 'fragments service running',
    author,
    githubUrl: 'https://github.com/Safal778/fragments',
    version,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
