const memory = require('../../src/model/data/memory');

describe('memory fragment data strategy', () => {
  beforeEach(() => memory._clear());

  test('writes and reads fragment metadata', async () => {
    const fragment = { id: 'one', type: 'text/plain' };
    await expect(memory.writeFragment('owner', fragment)).resolves.toEqual(fragment);
    await expect(memory.readFragment('owner', 'one')).resolves.toEqual(fragment);
  });

  test('writes and reads fragment data', async () => {
    const data = Buffer.from('hello');
    await expect(memory.writeFragmentData('owner', 'one', data)).resolves.toEqual(data);
    const result = await memory.readFragmentData('owner', 'one');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(data)).toBe(true);
  });

  test('lists metadata for one owner only', async () => {
    await memory.writeFragment('owner', { id: 'one', type: 'text/plain' });
    await memory.writeFragment('other-owner', { id: 'two', type: 'text/plain' });

    await expect(memory.listFragments('owner')).resolves.toEqual([
      { id: 'one', type: 'text/plain' },
    ]);
  });
});
