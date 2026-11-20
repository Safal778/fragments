const { createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      logger.warn({ ownerId: req.user, id: req.params.id }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    const data = await fragment.getData();
    logger.info({ ownerId: req.user, id: fragment.id }, 'Read fragment');
    return res.status(200).type(fragment.type).send(data);
  } catch (err) {
    logger.error({ err, id: req.params.id }, 'Unable to read fragment');
    return next(err);
  }
};
