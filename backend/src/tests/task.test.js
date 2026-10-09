const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

describe('Task and Kanban API Suite', () => {
  let pm, pmToken, project, dev, devToken;

  beforeEach(async () => {
    pm = await User.create({
      name: 'PM Task',
      email: 'pm_task@devtrack.io',
      password: 'Password123!',
      role: 'project_manager',
    });
    pmToken = pm.getSignedJwtToken();

    dev = await User.create({
      name: 'Dev Task',
      email: 'dev_task@devtrack.io',
      password: 'Password123!',
      role: 'developer',
    });
    devToken = dev.getSignedJwtToken();

    project = await Project.create({
      name: 'Task Test Project',
      key: 'TTP',
      description: 'Project for task suite testing',
      manager: pm._id,
      members: [pm._id, dev._id],
      createdBy: pm._id,
    });
  });

  test('POST /api/tasks - PM creates task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        title: 'Implement unit testing',
        description: 'Set up Jest and Supertest',
        project: project._id,
        priority: 'high',
        status: 'todo',
        assignedTo: dev._id,
        labels: ['Testing'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.title).toBe('Implement unit testing');
    expect(res.body.data.task.status).toBe('todo');
  });

  test('PATCH /api/tasks/:id/status - Update Kanban column status and order', async () => {
    const task = await Task.create({
      title: 'Move across Kanban',
      description: 'Testing drag and drop endpoint',
      project: project._id,
      priority: 'medium',
      status: 'todo',
      order: 0,
      createdBy: pm._id,
    });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}/status`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        status: 'in_progress',
        order: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe('in_progress');
    expect(res.body.data.task.order).toBe(1);
  });

  test('GET /api/tasks - Supports pagination and overdue filtering', async () => {
    await Task.create([
      {
        title: 'Overdue open task',
        project: project._id,
        createdBy: pm._id,
        dueDate: new Date(Date.now() - 86400000),
      },
      {
        title: 'Overdue completed task',
        project: project._id,
        createdBy: pm._id,
        dueDate: new Date(Date.now() - 86400000),
        status: 'completed',
      },
      {
        title: 'Upcoming task',
        project: project._id,
        createdBy: pm._id,
        dueDate: new Date(Date.now() + 86400000),
      },
    ]);

    const res = await request(app)
      .get(`/api/tasks?project=${project._id}&overdue=true&page=1&limit=1`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].title).toBe('Overdue open task');
    expect(res.body.data.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      pages: 1,
    });
  });
});
