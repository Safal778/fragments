const { createSuccessResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res, next) => {
  try {
    const fragments = await Fragment.byUser(req.user);

    // Return full metadata when expand=1
    const expand = req.query.expand === '1';

    const result = expand ? fragments : fragments.map((fragment) => fragment.id);

    logger.info({ ownerId: req.user, count: fragments.length, expand }, 'Listed user fragments');

    return res.status(200).json(createSuccessResponse({ fragments: result }));
  } catch (err) {
    logger.error({ err, ownerId: req.user }, 'Unable to list user fragments');
    return next(err);
  }
};
