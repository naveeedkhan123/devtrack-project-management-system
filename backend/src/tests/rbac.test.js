const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');

describe('Role-Based Authorization (RBAC) Suite', () => {
  let adminToken, devToken;
  let dev, foreignTask, foreignBug;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin_test@devtrack.io',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = admin.getSignedJwtToken();

    dev = await User.create({
      name: 'Dev User',
      email: 'dev_test@devtrack.io',
      password: 'Password123!',
      role: 'developer',
    });
    devToken = dev.getSignedJwtToken();

    const project = await Project.create({
      name: 'Private Project',
      key: 'PRIV',
      description: 'Restricted project fixture',
      manager: admin._id,
      members: [admin._id],
      createdBy: admin._id,
    });
    foreignTask = await Task.create({
      title: 'Private Task',
      project: project._id,
      createdBy: admin._id,
    });
    foreignBug = await Bug.create({
      title: 'Private Bug',
      description: 'Restricted bug fixture',
      project: project._id,
      reportedBy: admin._id,
    });
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

  test('Developer cannot read or update tasks outside their project membership', async () => {
    const getRes = await request(app)
      .get(`/api/tasks/${foreignTask._id}`)
      .set('Authorization', `Bearer ${devToken}`);
    const updateRes = await request(app)
      .patch(`/api/tasks/${foreignTask._id}/status`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ status: 'completed' });

    expect(getRes.status).toBe(403);
    expect(updateRes.status).toBe(403);
  });

  test('Developer cannot read or report bugs outside their project membership', async () => {
    const getRes = await request(app)
      .get(`/api/bugs/${foreignBug._id}`)
      .set('Authorization', `Bearer ${devToken}`);
    const listRes = await request(app)
      .get(`/api/bugs?project=${foreignBug.project}`)
      .set('Authorization', `Bearer ${devToken}`);
    const createRes = await request(app)
      .post('/api/bugs')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        title: 'Unauthorized Report',
        description: 'Must be rejected for a private project.',
        project: foreignBug.project,
      });

    expect(getRes.status).toBe(403);
    expect(listRes.status).toBe(403);
    expect(createRes.status).toBe(403);
  });
});
