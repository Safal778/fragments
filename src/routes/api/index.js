const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        return Fragment.isSupportedType(contentType.parse(req).type);
      } catch {
        return false;
      }
    },
  });

router.get('/fragments', require('./get'));
router.get('/fragments/:id', require('./get-fragment'));
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
