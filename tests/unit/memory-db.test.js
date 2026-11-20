const db = require('../../src/model/data/memory/memory-db');

describe('memory database', () => {
  beforeEach(() => db.clear());

  test('writes and reads values asynchronously', async () => {
    const value = { hello: 'world' };
    await expect(db.write('key', value)).resolves.toEqual(value);
    await expect(db.read('key')).resolves.toEqual(value);
  });

  test('returns undefined for an unknown key', async () => {
    await expect(db.read('missing')).resolves.toBeUndefined();
  });
});
