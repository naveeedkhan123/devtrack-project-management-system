const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

describe('Project-scoped comment access', () => {
  let developerToken;
  let task;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Project Admin',
      email: 'comment_admin@devtrack.io',
      password: 'Password123!',
      role: 'admin',
    });
    const developer = await User.create({
      name: 'Outside Developer',
      email: 'comment_dev@devtrack.io',
      password: 'Password123!',
      role: 'developer',
    });
    developerToken = developer.getSignedJwtToken();

    const project = await Project.create({
      name: 'Private Comment Project',
      key: 'CMT',
      description: 'Project used to verify comment access boundaries',
      manager: admin._id,
      createdBy: admin._id,
      members: [admin._id],
    });
    task = await Task.create({
      title: 'Private discussion',
      project: project._id,
      createdBy: admin._id,
    });
  });

  test('Developer cannot read comments on a task outside their project', async () => {
    const response = await request(app)
      .get(`/api/comments/task/${task._id}`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(response.status).toBe(403);
  });

  test('Developer cannot comment on a task outside their project', async () => {
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${developerToken}`)
      .send({
        content: 'Unauthorized comment',
        entityType: 'task',
        entityId: task._id,
      });

    expect(response.status).toBe(403);
  });
});
