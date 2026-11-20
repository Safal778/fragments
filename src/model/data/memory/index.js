const memory = require('./memory-db');

const fragmentKey = (ownerId, id) => `${ownerId}:${id}`;
const fragmentDataKey = (ownerId, id) => `${fragmentKey(ownerId, id)}:data`;

module.exports.readFragment = async (ownerId, id) => memory.read(fragmentKey(ownerId, id));

module.exports.listFragments = async (ownerId) => {
  const fragments = await memory.readAll(`${ownerId}:`);
  return fragments.filter((fragment) => fragment && fragment.id);
};

module.exports.writeFragment = async (ownerId, fragment) =>
  memory.write(fragmentKey(ownerId, fragment.id), fragment);

module.exports.readFragmentData = async (ownerId, id) => memory.read(fragmentDataKey(ownerId, id));

module.exports.writeFragmentData = async (ownerId, id, data) =>
  memory.write(fragmentDataKey(ownerId, id), data);

module.exports._clear = memory.clear;
