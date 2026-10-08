const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Role-Based Authorization (RBAC) Suite', () => {
  let adminToken, pmToken, devToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin_test@devtrack.io',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = admin.getSignedJwtToken();

    const pm = await User.create({
      name: 'PM User',
      email: 'pm_test@devtrack.io',
      password: 'Password123!',
      role: 'project_manager',
    });
    pmToken = pm.getSignedJwtToken();

    const dev = await User.create({
      name: 'Dev User',
      email: 'dev_test@devtrack.io',
      password: 'Password123!',
      role: 'developer',
    });
    devToken = dev.getSignedJwtToken();
  });

  test('Developer role cannot create projects (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        name: 'Unauthorized Project',
        key: 'UNAUTH',
        description: 'Testing RBAC restriction',
        manager: '507f1f77bcf86cd799439011',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Developer role cannot access admin user management (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users/admin')
      .set('Authorization', `Bearer ${devToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin role can access admin user management (200 OK)', async () => {
    const res = await request(app)
      .get('/api/users/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeDefined();
  });
});
