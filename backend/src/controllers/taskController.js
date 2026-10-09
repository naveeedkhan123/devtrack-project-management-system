const Task = require('../models/Task');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');
const { getAccessibleProjectIds, canAccessProject } = require('../services/projectAccess');
const Comment = require('../models/Comment');
const {
  getPagination,
  getPaginationMetadata,
  isAllowedFilter,
  isValidSearch,
  escapeRegex,
} = require('../utils/pagination');

/**
 * @desc    Get all tasks with filters
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo, search, overdue } = req.query;
    const pagination = getPagination(req.query);
    if (!pagination) return errorResponse(res, 'page and limit must be positive integers', 400);
    if (!isAllowedFilter(status, ['todo', 'in_progress', 'review', 'completed']) ||
        !isAllowedFilter(priority, ['low', 'medium', 'high', 'critical']) ||
        (project !== undefined && project !== 'all' && typeof project !== 'string') ||
        (assignedTo !== undefined && assignedTo !== 'all' &&
          assignedTo !== 'unassigned' && typeof assignedTo !== 'string') ||
        !isValidSearch(search)) {
      return errorResponse(res, 'Invalid task filters', 400);
    }
    let query = {};

    if (project && project !== 'all') {
      query.project = project;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      const statusConditions = [{ status: { $ne: 'completed' } }];
      if (query.status) statusConditions.push({ status: query.status });
      query.$and = [...(query.$and || []), ...statusConditions];
      delete query.status;
    } else if (overdue && overdue !== 'false') {
      return errorResponse(res, 'overdue must be true or false', 400);
    }

    if (req.user.role === 'developer') {
      const accessibleProjectIds = await getAccessibleProjectIds(req.user);
      if (project && project !== 'all' &&
        !accessibleProjectIds.some((id) => id.toString() === project)) {
        return errorResponse(res, 'Not authorized to view tasks in this project', 403);
      }
      query.project = project && project !== 'all'
        ? project
        : { $in: accessibleProjectIds };
    }

    if (search) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { title: { $regex: escapeRegex(search), $options: 'i' } },
            { description: { $regex: escapeRegex(search), $options: 'i' } },
            { labels: { $regex: escapeRegex(search), $options: 'i' } },
          ],
        },
      ];
    }

    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query)
        .populate('project', 'name key status')
        .populate('assignedTo', 'name email avatar role')
        .populate('createdBy', 'name email')
        .sort({ order: 1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
    ]);

    return successResponse(res, 'Tasks fetched successfully', {
      tasks,
      total,
      pagination: getPaginationMetadata(pagination, total),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task details
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name key status members manager')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    if (!canAccessProject(task.project, req.user)) {
      return errorResponse(res, 'Not authorized to view this task', 403);
    }

    return successResponse(res, 'Task fetched successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private (Admin, Project Manager)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, priority, status, assignedTo, dueDate, labels } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Determine highest order in target column
    const highestTask = await Task.findOne({
      project,
      status: status || 'todo',
    }).sort({ order: -1 });

    const newOrder = highestTask ? highestTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description: description || '',
      project,
      priority: priority || 'medium',
      status: status || 'todo',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      labels: labels || [],
      order: newOrder,
      createdBy: req.user._id,
    });

    await task.populate('project', 'name key');
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'created_task',
      details: `${req.user.name} created task "${task.title}" in [${projectDoc.key}]`,
      entityType: 'task',
      entityId: task._id,
      project: projectDoc._id,
    });

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        title: 'Task Assigned',
        message: `${req.user.name} assigned task "${task.title}" to you`,
        type: 'task_assigned',
        link: `/tasks/${task._id}`,
      });
    }

    return successResponse(res, 'Task created successfully', { task }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    const projectDoc = await Project.findById(task.project).select('members manager');
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to update this task', 403);
    }

    const { title, description, priority, status, assignedTo, dueDate, labels, order } = req.body;

    // Permission check: Developers can only update status if they are assigned or project member
    if (req.user.role === 'developer') {
      if (status && status !== task.status) {
        task.status = status;
      }
    } else {
      // Admin and PM can update all fields
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (order !== undefined) task.order = order;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (labels !== undefined) task.labels = labels;

      if (assignedTo !== undefined) {
        const prevAssignee = task.assignedTo ? task.assignedTo.toString() : null;
        task.assignedTo = assignedTo || null;

        // If newly assigned
        if (assignedTo && assignedTo.toString() !== prevAssignee) {
          await createNotification({
            recipient: assignedTo,
            sender: req.user._id,
            title: 'Task Assigned',
            message: `${req.user.name} assigned task "${task.title}" to you`,
            type: 'task_assigned',
            link: `/tasks/${task._id}`,
          });
        }
      }
    }

    await task.save();
    await task.populate('project', 'name key');
    await task.populate('assignedTo', 'name email avatar');

    await logActivity({
      user: req.user._id,
      action: 'updated_task',
      details: `${req.user.name} updated task "${task.title}"`,
      entityType: 'task',
      entityId: task._id,
      project: task.project._id,
    });

    return successResponse(res, 'Task updated successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status & kanban position
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    const projectDoc = await Project.findById(task.project).select('members manager');
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to update this task', 403);
    }

    const previousStatus = task.status;
    task.status = status;
    if (order !== undefined) {
      task.order = order;
    }

    await task.save();
    await task.populate('project', 'name key');
    await task.populate('assignedTo', 'name email avatar');

    // Notify assignee if someone else moved their task
    if (
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user._id.toString() &&
      previousStatus !== status
    ) {
      await createNotification({
        recipient: task.assignedTo._id,
        sender: req.user._id,
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed to ${status.replace('_', ' ').toUpperCase()}`,
        type: 'status_changed',
        link: `/tasks/${task._id}`,
      });
    }

    await logActivity({
      user: req.user._id,
      action: 'moved_task_status',
      details: `${req.user.name} moved "${task.title}" from ${previousStatus} to ${status}`,
      entityType: 'task',
      entityId: task._id,
      project: task.project._id,
    });

    return successResponse(res, 'Task status updated successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin, Project Manager)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    const projectDoc = await Project.findById(task.project).select('members manager');
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to delete this task', 403);
    }

    await Comment.deleteMany({ entityType: 'task', entityId: task._id });
    await Task.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user._id,
      action: 'deleted_task',
      details: `${req.user.name} deleted task "${task.title}"`,
      entityType: 'task',
      entityId: task._id,
      project: task.project,
    });

    return successResponse(res, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
