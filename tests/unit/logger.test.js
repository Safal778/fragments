describe('Logger configuration', () => {
  const originalLogLevel = process.env.FRAGMENTS_LOG_LEVEL;

  afterEach(() => {
    if (originalLogLevel === undefined) {
      delete process.env.FRAGMENTS_LOG_LEVEL;
    } else {
      process.env.FRAGMENTS_LOG_LEVEL = originalLogLevel;
    }

    jest.resetModules();
    jest.unmock('pino');
  });

  test('configures pretty logging when debug level is enabled', () => {
    process.env.FRAGMENTS_LOG_LEVEL = 'debug';

    jest.resetModules();

    const mockPino = jest.fn(() => ({ info: jest.fn() }));
    jest.doMock('pino', () => mockPino);

    require('../../src/logger');

    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug',
        redact: ['req.headers.authorization'],
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
    );
  });
});
