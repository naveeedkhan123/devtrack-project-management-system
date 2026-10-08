const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Bug = require('../models/Bug');

describe('Bug Tracking API Suite', () => {
  let dev, devToken, project;

  beforeEach(async () => {
    dev = await User.create({
      name: 'Dev Tester',
      email: 'dev_bug@devtrack.io',
      password: 'Password123!',
      role: 'developer',
    });
    devToken = dev.getSignedJwtToken();

    project = await Project.create({
      name: 'Bug Test Project',
      key: 'BTP',
      description: 'Project for bug testing',
      manager: dev._id,
      members: [dev._id],
      createdBy: dev._id,
    });
  });

  test('POST /api/bugs - Developer reports bug', async () => {
    const res = await request(app)
      .post('/api/bugs')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        title: 'Crash on clicking save',
        description: 'App displays blank screen',
        project: project._id,
        severity: 'high',
        priority: 'critical',
        environment: 'Staging',
        stepsToReproduce: 'Click save on empty form',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bug.title).toBe('Crash on clicking save');
    expect(res.body.data.bug.status).toBe('open');
  });

  test('PUT /api/bugs/:id - Update bug resolution notes & status', async () => {
    const bug = await Bug.create({
      title: 'UI alignment bug',
      description: 'Button misplaced',
      project: project._id,
      reportedBy: dev._id,
      severity: 'low',
      priority: 'low',
      status: 'open',
    });

    const res = await request(app)
      .put(`/api/bugs/${bug._id}`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        status: 'resolved',
        resolutionNotes: 'Fixed CSS flex alignment in navbar',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bug.status).toBe('resolved');
    expect(res.body.data.bug.resolutionNotes).toBe('Fixed CSS flex alignment in navbar');
  });
});
