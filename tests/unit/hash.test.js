const hash = require('../../src/hash');

describe('hash', () => {
  test('returns a deterministic SHA-256 hash', () => {
    expect(hash('test-user1@fragments-testing.com')).toBe(
      '26bb498c59e22127d17ca9ca100059edb174b74c2c64158e45845227bb43bb63'
    );
  });

  test('does not expose the original value', () => {
    expect(hash('secret@example.com')).not.toContain('secret@example.com');
  });
});
