const { createSuccessResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res, next) => {
  try {
    const fragments = await Fragment.byUser(req.user);
    const ids = fragments.map((fragment) => fragment.id);
    logger.info({ ownerId: req.user, count: ids.length }, 'Listed user fragments');
    return res.status(200).json(createSuccessResponse({ fragments: ids }));
  } catch (err) {
    logger.error({ err, ownerId: req.user }, 'Unable to list user fragments');
    return next(err);
  }
};
