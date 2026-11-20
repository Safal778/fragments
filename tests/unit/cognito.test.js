describe('AWS Cognito authentication', () => {
  const originalPoolId = process.env.AWS_COGNITO_POOL_ID;
  const originalClientId = process.env.AWS_COGNITO_CLIENT_ID;

  const mockVerify = jest.fn();
  const mockHydrate = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.AWS_COGNITO_POOL_ID = 'test-pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client';

    mockHydrate.mockResolvedValue();

    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: jest.fn(() => ({
          verify: mockVerify,
          hydrate: mockHydrate,
        })),
      },
    }));
  });

  afterEach(() => {
    if (originalPoolId === undefined) {
      delete process.env.AWS_COGNITO_POOL_ID;
    } else {
      process.env.AWS_COGNITO_POOL_ID = originalPoolId;
    }

    if (originalClientId === undefined) {
      delete process.env.AWS_COGNITO_CLIENT_ID;
    } else {
      process.env.AWS_COGNITO_CLIENT_ID = originalClientId;
    }

    jest.dontMock('aws-jwt-verify');
    jest.resetModules();
  });

  test('creates a Cognito JWT verifier using environment variables', () => {
    const { CognitoJwtVerifier } = require('aws-jwt-verify');

    const cognito = require('../../src/auth/cognito');

    expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
      userPoolId: 'test-pool',
      clientId: 'test-client',
      tokenUse: 'id',
    });

    expect(mockHydrate).toHaveBeenCalled();
    expect(typeof cognito.strategy).toBe('function');
    expect(typeof cognito.authenticate).toBe('function');
  });

  test('rejects missing Cognito environment variables', () => {
    delete process.env.AWS_COGNITO_POOL_ID;

    expect(() => require('../../src/auth/cognito')).toThrow(
      'missing expected env vars: AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID'
    );
  });

  test('creates a bearer authentication strategy', () => {
    const cognito = require('../../src/auth/cognito');

    const strategy = cognito.strategy();

    expect(strategy.name).toBe('bearer');
  });

  test('accepts a valid Cognito ID token', async () => {
    const cognito = require('../../src/auth/cognito');
    mockVerify.mockResolvedValueOnce({
      email: 'test@example.com',
    });

    const strategy = cognito.strategy();
    const done = jest.fn();

    await strategy._verify('valid-token', done);

    expect(mockVerify).toHaveBeenCalledWith('valid-token');
    expect(done).toHaveBeenCalledWith(null, 'test@example.com');
  });

  test('rejects an invalid Cognito ID token', async () => {
    const cognito = require('../../src/auth/cognito');
    mockVerify.mockRejectedValueOnce(new Error('invalid token'));

    const strategy = cognito.strategy();
    const done = jest.fn();

    await strategy._verify('invalid-token', done);

    expect(mockVerify).toHaveBeenCalledWith('invalid-token');
    expect(done).toHaveBeenCalledWith(null, false);
  });
});
