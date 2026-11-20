const store = new Map();

module.exports.read = async (key) => store.get(key);

module.exports.write = async (key, value) => {
  store.set(key, value);
  return value;
};

module.exports.del = async (key) => {
  store.delete(key);
};

module.exports.readAll = async (prefix) =>
  [...store.entries()].filter(([key]) => key.startsWith(prefix)).map(([, value]) => value);

module.exports.clear = () => store.clear();
