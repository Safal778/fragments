const AUTH_ENV_KEYS = ['AWS_COGNITO_POOL_ID', 'AWS_COGNITO_CLIENT_ID', 'HTPASSWD_FILE', 'NODE_ENV'];

let originalAuthEnv;

beforeEach(() => {
  originalAuthEnv = Object.fromEntries(AUTH_ENV_KEYS.map((key) => [key, process.env[key]]));
  AUTH_ENV_KEYS.forEach((key) => delete process.env[key]);
  jest.resetModules();
});

afterEach(() => {
  AUTH_ENV_KEYS.forEach((key) => {
    if (originalAuthEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalAuthEnv[key];
    }
  });
  jest.resetModules();
});

describe('auth configuration', () => {
  test('selects Basic Auth outside production', () => {
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';
    process.env.NODE_ENV = 'test';

    const auth = require('../../src/auth');

    expect(typeof auth.strategy).toBe('function');
    expect(typeof auth.authenticate).toBe('function');
  });

  test('rejects incomplete Cognito configuration', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';

    expect(() => require('../../src/auth')).toThrow(
      'AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID must both be configured'
    );
  });

  test('rejects simultaneous Cognito and Basic Auth configuration', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';

    expect(() => require('../../src/auth')).toThrow(
      'env contains configuration for both AWS Cognito and HTTP Basic Auth'
    );
  });

  test('rejects Basic Auth in production', () => {
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';
    process.env.NODE_ENV = 'production';

    expect(() => require('../../src/auth')).toThrow(
      'HTTP Basic Auth is only available outside production'
    );
  });

  test('rejects missing authorization configuration', () => {
    expect(() => require('../../src/auth')).toThrow(
      'Missing authorization configuration: configure Cognito or HTTP Basic Auth.'
    );
  });
});
