const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res, next) => {
  try {
    let type;
    try {
      type = contentType.parse(req).type;
    } catch (err) {
      logger.warn({ err }, 'Unable to parse Content-Type header');
      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    if (!Fragment.isSupportedType(type)) {
      logger.warn({ type }, 'Unsupported fragment content type');
      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    if (!Buffer.isBuffer(req.body)) {
      logger.warn({ type }, 'Fragment request body was not parsed as a Buffer');
      return res.status(400).json(createErrorResponse(400, 'request body must be a Buffer'));
    }

    logger.debug({ type, size: req.body.length }, 'Creating fragment');
    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.setData(req.body);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl).toString();
    logger.info({ id: fragment.id, type, size: fragment.size }, 'Fragment created');
    return res
      .status(201)
      .setHeader('Location', location)
      .json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Unexpected error creating fragment');
    return next(err);
  }
};
