const request = require('supertest');
const app = require('../app');
describe('Authentication API Suite', () => {
  const testUser = {
    name: 'Test Engineer',
    email: 'test@devtrack.io',
    password: 'Password123!',
    role: 'developer',
  };

  test('POST /api/auth/register - Successfully register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  test('POST /api/auth/register - Ignores a client-supplied administrator role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'forged-admin@devtrack.io', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('developer');
  });

  test('POST /api/auth/register - Does not echo invalid passwords in validation errors', async () => {
    const password = 'x';
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'invalid@devtrack.io', password });

    expect(res.status).toBe(422);
    expect(JSON.stringify(res.body)).not.toContain(password);
  });

  test('POST /api/auth/register - Reject registration with existing email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Login with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login - Reject invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Access protected profile with Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  test('GET /api/auth/me - Reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /health - Reports the MongoDB connection state', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe('connected');
  });
});
