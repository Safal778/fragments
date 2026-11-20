const Fragment = require('../../src/model/fragment');
const memory = require('../../src/model/data/memory');

describe('Fragment', () => {
  beforeEach(() => memory._clear());

  test('recognizes supported content types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('image/png')).toBe(true);
    expect(Fragment.isSupportedType('application/octet-stream')).toBe(false);
  });

  test('saves metadata and data in the data strategy', async () => {
    const fragment = new Fragment({ ownerId: 'owner', type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const saved = await Fragment.byId('owner', fragment.id);
    expect(saved).toEqual(expect.objectContaining({ id: fragment.id, size: 5 }));
    await expect(saved.getData()).resolves.toEqual(Buffer.from('hello'));
  });
});
