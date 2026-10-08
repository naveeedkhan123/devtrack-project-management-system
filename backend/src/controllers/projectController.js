const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all accessible projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    let query = {};

    // Developer can only see projects they are a member of or manage
    if (req.user.role === 'developer') {
      query.$or = [{ members: req.user._id }, { manager: req.user._id }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { key: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Attach task & bug metrics to each project
    const projectsWithMetrics = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks, openBugs] = await Promise.all([
          Task.countDocuments({ project: project._id }),
          Task.countDocuments({ project: project._id, status: 'completed' }),
          Bug.countDocuments({ project: project._id, status: { $in: ['open', 'in_progress', 'reopened'] } }),
        ]);

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          metrics: {
            totalTasks,
            completedTasks,
            openBugs,
            progress,
          },
        };
      })
    );

    return successResponse(res, 'Projects fetched successfully', { projects: projectsWithMetrics });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project details
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .populate('createdBy', 'name email');

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Role check: developer must be a member or manager
    if (
      req.user.role === 'developer' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString()) &&
      project.manager._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'Not authorized to view this project', 403);
    }

    const [tasks, bugs] = await Promise.all([
      Task.find({ project: project._id })
        .populate('assignedTo', 'name email avatar')
        .sort({ order: 1, createdAt: -1 }),
      Bug.find({ project: project._id })
        .populate('reportedBy', 'name email avatar')
        .populate('assignedTo', 'name email avatar')
        .sort({ createdAt: -1 }),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return successResponse(res, 'Project fetched successfully', {
      project: {
        ...project.toObject(),
        metrics: {
          totalTasks: tasks.length,
          completedTasks,
          openBugs: bugs.filter((b) => ['open', 'in_progress', 'reopened'].includes(b.status)).length,
          progress,
        },
      },
      tasks,
      bugs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private (Admin, Project Manager)
 */
const createProject = async (req, res, next) => {
  try {
    const { name, key, description, status, priority, startDate, deadline, manager, members } = req.body;

    const existingKey = await Project.findOne({ key: key.toUpperCase() });
    if (existingKey) {
      return errorResponse(res, `Project key '${key.toUpperCase()}' is already in use`, 400);
    }

    // Ensure manager is included in members
    let memberList = Array.isArray(members) ? [...members] : [];
    if (!memberList.includes(manager)) {
      memberList.push(manager);
    }

    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      deadline: deadline || null,
      manager,
      members: memberList,
      createdBy: req.user._id,
    });

    await project.populate('manager', 'name email avatar');
    await project.populate('members', 'name email avatar role');

    await logActivity({
      user: req.user._id,
      action: 'created_project',
      details: `${req.user.name} created project [${project.key}] ${project.name}`,
      entityType: 'project',
      entityId: project._id,
      project: project._id,
    });

    // Notify project members
    for (const memberId of memberList) {
      if (memberId.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: memberId,
          sender: req.user._id,
          title: 'Added to Project',
          message: `You were added to the project [${project.key}] ${project.name}`,
          type: 'member_added',
          link: `/projects/${project._id}`,
        });
      }
    }

    return successResponse(res, 'Project created successfully', { project }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin, Project Manager)
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // If PM, must be assigned manager or creator
    if (
      req.user.role === 'project_manager' &&
      project.manager.toString() !== req.user._id.toString() &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'You can only update projects that you manage', 403);
    }

    const { name, description, status, priority, startDate, deadline, manager } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline;
    if (manager) project.manager = manager;

    await project.save();
    await project.populate('manager', 'name email avatar');
    await project.populate('members', 'name email avatar role');

    await logActivity({
      user: req.user._id,
      action: 'updated_project',
      details: `${req.user.name} updated project [${project.key}] ${project.name}`,
      entityType: 'project',
      entityId: project._id,
      project: project._id,
    });

    return successResponse(res, 'Project updated successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Cascade delete associated tasks and bugs
    await Promise.all([
      Task.deleteMany({ project: project._id }),
      Bug.deleteMany({ project: project._id }),
      Project.findByIdAndDelete(project._id),
    ]);

    await logActivity({
      user: req.user._id,
      action: 'deleted_project',
      details: `Admin deleted project [${project.key}] ${project.name}`,
      entityType: 'project',
      entityId: project._id,
    });

    return successResponse(res, 'Project and its associated tasks/bugs deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin, Project Manager)
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return errorResponse(res, 'User not found', 404);
    }

    if (project.members.some((m) => m.toString() === userId)) {
      return errorResponse(res, 'User is already a member of this project', 400);
    }

    project.members.push(userId);
    await project.save();

    await project.populate('members', 'name email avatar role');

    await logActivity({
      user: req.user._id,
      action: 'added_project_member',
      details: `${req.user.name} added ${userToAdd.name} to [${project.key}]`,
      entityType: 'project',
      entityId: project._id,
      project: project._id,
    });

    await createNotification({
      recipient: userToAdd._id,
      sender: req.user._id,
      title: 'Added to Project',
      message: `You were added to the project [${project.key}] ${project.name}`,
      type: 'member_added',
      link: `/projects/${project._id}`,
    });

    return successResponse(res, 'Team member added successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Admin, Project Manager)
 */
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.manager.toString() === userId) {
      return errorResponse(res, 'Cannot remove the assigned Project Manager from members', 400);
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    await project.populate('members', 'name email avatar role');

    return successResponse(res, 'Team member removed successfully', { project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
