const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const { restoreDatabaseSnapshot } = require('../services/persistenceService');

describe('Data Persistence & Integrity Suite', () => {
  let authToken;
  let testUserId;
  let testProjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Persistent Dev',
      email: `dev_${Date.now()}@devtrack.io`,
      password: 'Password123!',
      role: 'project_manager',
    });
    authToken = user.getSignedJwtToken();
    testUserId = user._id;

    // Create an active project for testing
    const project = await Project.create({
      name: 'Persistence Project',
      key: `PST${Math.floor(Math.random() * 900 + 100)}`,
      description: 'Project to verify MongoDB persistence',
      status: 'active',
      priority: 'high',
      manager: testUserId,
      createdBy: testUserId,
      members: [testUserId],
    });
    testProjectId = project._id;
  });

  test('User profile update is persisted in MongoDB and retrieved via /me', async () => {
    const updateRes = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name Permanent',
        bio: 'Updated Bio Permanent',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.user.name).toBe('Updated Name Permanent');
    expect(updateRes.body.data.user.bio).toBe('Updated Bio Permanent');

    // Fetch /me to simulate page refresh / reopen
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe('Updated Name Permanent');
    expect(meRes.body.data.user.bio).toBe('Updated Bio Permanent');
  });

  test('Task creation and Kanban status transition persist across queries', async () => {
    // 1. Create a task
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Persistent Architecture Review',
        project: testProjectId,
        priority: 'high',
        status: 'todo',
      });

    expect(createRes.status).toBe(201);
    const taskId = createRes.body.data.task._id;

    // 2. Drag task to completed in Kanban
    const statusRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'completed',
        order: 1,
      });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.task.status).toBe('completed');

    // 3. Re-query tasks from database
    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.task.status).toBe('completed');
  });

  test('Database snapshot restore never deletes existing MongoDB records', async () => {
    const restored = await restoreDatabaseSnapshot();
    expect(restored).toBe(false);

    const userInDb = await User.findById(testUserId);
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toBe('Persistent Dev');
  });
});
