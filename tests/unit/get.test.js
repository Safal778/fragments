const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated users can list and retrieve their fragments', async () => {
    const created = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello fragment');

    const id = created.body.fragment.id;
    const list = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(list.body.fragments).toContain(id);

    const fragment = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(fragment.statusCode).toBe(200);
    expect(fragment.headers['content-type']).toMatch(/^text\/plain/);
    expect(fragment.text).toBe('hello fragment');
  });

  test('missing fragments return 404', async () => {
    const response = await request(app)
      .get('/v1/fragments/missing-fragment')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: { code: 404, message: 'fragment not found' },
    });
  });

  test('unauthenticated fragment retrieval is denied', () =>
    request(app).get('/v1/fragments/missing-fragment').expect(401));

  test("users cannot retrieve another user's fragment", async () => {
    const created = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('private fragment');
    expect(created.statusCode).toBe(201);

    const response = await request(app)
      .get(`/v1/fragments/${created.body.fragment.id}`)
      .auth('test-user2@fragments-testing.com', 'test-password2');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('fragment not found');
  });

  test('GET /v1/fragments?expand=1 returns full fragment metadata', async () => {
    const created = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('Lab 6 test fragment');

    expect(created.statusCode).toBe(201);

    const response = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');

    expect(response.body.fragments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.body.fragment.id,
          ownerId: created.body.fragment.ownerId,
          type: 'text/plain',
          size: Buffer.byteLength('Lab 6 test fragment'),
          created: expect.any(String),
          updated: expect.any(String),
        }),
      ])
    );
  });

  test('GET /v1/fragments without expand returns IDs only', async () => {
    const response = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(response.statusCode).toBe(200);
    expect(response.body.fragments).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  test('GET /v1/fragments?expand=1 requires authentication', async () => {
    await request(app).get('/v1/fragments?expand=1').expect(401);
  });
});
