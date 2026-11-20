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

  test('rejects fragment data that is not a Buffer', async () => {
    const fragment = new Fragment({
      ownerId: 'owner',
      type: 'text/plain',
    });

    await expect(fragment.setData('hello')).rejects.toThrow('fragment data must be a Buffer');
  });

  test('handles errors when saving fragment metadata', async () => {
    const spy = jest
      .spyOn(memory, 'writeFragment')
      .mockRejectedValueOnce(new Error('metadata failure'));

    try {
      const fragment = new Fragment({
        ownerId: 'owner',
        type: 'text/plain',
      });

      await expect(fragment.save()).rejects.toThrow('metadata failure');
    } finally {
      spy.mockRestore();
    }
  });

  test('handles errors when saving fragment data', async () => {
    const spy = jest
      .spyOn(memory, 'writeFragmentData')
      .mockRejectedValueOnce(new Error('data failure'));

    try {
      const fragment = new Fragment({
        ownerId: 'owner',
        type: 'text/plain',
      });

      await expect(fragment.setData(Buffer.from('hello'))).rejects.toThrow('data failure');
    } finally {
      spy.mockRestore();
    }
  });

  test('returns null when a fragment does not exist', async () => {
    const result = await Fragment.byId('owner', 'missing-id');

    expect(result).toBeNull();
  });

  test('lists fragments belonging to a user', async () => {
    const fragment = new Fragment({
      ownerId: 'owner',
      type: 'text/plain',
    });

    await fragment.setData(Buffer.from('hello'));

    const fragments = await Fragment.byUser('owner');

    expect(fragments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: fragment.id,
          ownerId: 'owner',
        }),
      ])
    );
  });
});
