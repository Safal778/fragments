const crypto = require('crypto');
const data = require('./data');
const logger = require('../logger');

const SUPPORTED_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
]);

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || this.created;
    this.type = type;
    this.size = size;
  }

  static isSupportedType(type) {
    return typeof type === 'string' && SUPPORTED_TYPES.has(type);
  }

  static async byId(ownerId, id) {
    const fragment = await data.readFragment(ownerId, id);
    return fragment ? new Fragment(fragment) : null;
  }

  static async byUser(ownerId) {
    const fragments = await data.listFragments(ownerId);
    return fragments.map((fragment) => new Fragment(fragment));
  }

  async save() {
    this.updated = new Date().toISOString();
    try {
      await data.writeFragment(this.ownerId, { ...this });
      logger.info({ id: this.id, ownerId: this.ownerId }, 'Fragment metadata saved');
    } catch (err) {
      logger.error({ err, id: this.id }, 'Unable to save fragment metadata');
      throw err;
    }
    return this;
  }

  async getData() {
    logger.debug({ id: this.id, ownerId: this.ownerId }, 'Reading fragment data');
    return data.readFragmentData(this.ownerId, this.id);
  }

  async setData(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      logger.warn({ id: this.id }, 'Rejected non-Buffer fragment data');
      throw new TypeError('fragment data must be a Buffer');
    }
    this.size = buffer.length;
    this.updated = new Date().toISOString();
    try {
      await data.writeFragmentData(this.ownerId, this.id, buffer);
    } catch (err) {
      logger.error({ err, id: this.id }, 'Unable to save fragment data');
      throw err;
    }
    await this.save();
    return this;
  }
}

module.exports = Fragment;
module.exports.Fragment = Fragment;
