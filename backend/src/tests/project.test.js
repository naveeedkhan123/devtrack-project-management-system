const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');

describe('Project Management API Suite', () => {
  let admin, adminToken, pm, pmToken;

  beforeEach(async () => {
    admin = await User.create({
      name: 'Admin User',
      email: 'admin_proj@devtrack.io',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = admin.getSignedJwtToken();

    pm = await User.create({
      name: 'PM User',
      email: 'pm_proj@devtrack.io',
      password: 'Password123!',
      role: 'project_manager',
    });
    pmToken = pm.getSignedJwtToken();
  });

  test('POST /api/projects - PM can create project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Alpha Project',
        key: 'ALP',
        description: 'First project for testing',
        manager: pm._id,
        priority: 'high',
        status: 'active',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.key).toBe('ALP');
  });

  test('GET /api/projects - Retrieve project list', async () => {
    await Project.create({
      name: 'Project One',
      key: 'PONE',
      description: 'Testing listing',
      manager: pm._id,
      createdBy: admin._id,
    });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projects.length).toBeGreaterThanOrEqual(1);
  });
});
