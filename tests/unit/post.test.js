const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', async () => {
    await request(app).post('/v1/fragments').type('text').send('hello').expect(401);
  });

  test('creates an authenticated plain text fragment', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe(
      `http://localhost:8080/v1/fragments/${response.body.fragment.id}`
    );
    expect(response.body.fragment).toEqual(
      expect.objectContaining({
        ownerId: hash('test-user1@fragments-testing.com'),
        type: 'text/plain',
        size: 5,
      })
    );
    expect(response.body.fragment.created).toEqual(expect.any(String));
    expect(response.body.fragment.updated).toEqual(expect.any(String));
  });

  test('rejects unsupported content types', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/octet-stream')
      .send(Buffer.from('hello'));

    expect(response.statusCode).toBe(415);
    expect(response.body.status).toBe('error');
  });

  test('rejects requests with malformed Content-Type', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'invalid content type')
      .send('hello');

    expect(response.statusCode).toBe(415);
    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(415);
  });

  test('handles unexpected errors when creating a fragment', async () => {
    const Fragment = require('../../src/model/fragment');

    const spy = jest
      .spyOn(Fragment.prototype, 'setData')
      .mockRejectedValueOnce(new Error('database failure'));

    try {
      const response = await request(app)
        .post('/v1/fragments')
        .auth('test-user1@fragments-testing.com', 'test-password1')
        .set('Content-Type', 'text/plain')
        .send('hello');

      expect(response.statusCode).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe(500);
    } finally {
      spy.mockRestore();
    }
  });
});
