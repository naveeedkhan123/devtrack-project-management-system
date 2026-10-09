const Bug = require('../models/Bug');
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
 * @desc    Get all bugs with filters
 * @route   GET /api/bugs
 * @access  Private
 */
const getBugs = async (req, res, next) => {
  try {
    const { project, status, severity, priority, assignedTo, search } = req.query;
    const pagination = getPagination(req.query);
    if (!pagination) return errorResponse(res, 'page and limit must be positive integers', 400);
    if (!isAllowedFilter(status, ['open', 'in_progress', 'resolved', 'closed', 'reopened']) ||
        !isAllowedFilter(severity, ['low', 'medium', 'high', 'critical']) ||
        !isAllowedFilter(priority, ['low', 'medium', 'high', 'critical']) ||
        (project !== undefined && project !== 'all' && typeof project !== 'string') ||
        (assignedTo !== undefined && assignedTo !== 'all' &&
          assignedTo !== 'unassigned' && typeof assignedTo !== 'string') ||
        !isValidSearch(search)) {
      return errorResponse(res, 'Invalid bug filters', 400);
    }
    let query = {};

    if (project && project !== 'all') {
      query.project = project;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
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

    if (req.user.role === 'developer') {
      const accessibleProjectIds = await getAccessibleProjectIds(req.user);
      if (project && project !== 'all' &&
        !accessibleProjectIds.some((id) => id.toString() === project)) {
        return errorResponse(res, 'Not authorized to view bugs in this project', 403);
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
            { environment: { $regex: escapeRegex(search), $options: 'i' } },
          ],
        },
      ];
    }

    const [total, bugs] = await Promise.all([
      Bug.countDocuments(query),
      Bug.find(query)
        .populate('project', 'name key status')
        .populate('reportedBy', 'name email avatar')
        .populate('assignedTo', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
    ]);

    return successResponse(res, 'Bugs fetched successfully', {
      bugs,
      total,
      pagination: getPaginationMetadata(pagination, total),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single bug details
 * @route   GET /api/bugs/:id
 * @access  Private
 */
const getBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project', 'name key status members manager')
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar role');

    if (!bug) {
      return errorResponse(res, 'Bug not found', 404);
    }
    if (!canAccessProject(bug.project, req.user)) {
      return errorResponse(res, 'Not authorized to view this bug', 403);
    }

    return successResponse(res, 'Bug fetched successfully', { bug });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report a new bug
 * @route   POST /api/bugs
 * @access  Private (All authenticated users)
 */
const createBug = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project,
      severity,
      priority,
      status,
      assignedTo,
      environment,
      stepsToReproduce,
      expectedResult,
      actualResult,
    } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return errorResponse(res, 'Project not found', 404);
    }
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to report bugs in this project', 403);
    }

    const bug = await Bug.create({
      title,
      description,
      project,
      reportedBy: req.user._id,
      assignedTo: assignedTo || null,
      severity: severity || 'medium',
      priority: priority || 'medium',
      status: status || 'open',
      environment: environment || 'Production',
      stepsToReproduce: stepsToReproduce || '',
      expectedResult: expectedResult || '',
      actualResult: actualResult || '',
    });

    await bug.populate('project', 'name key');
    await bug.populate('reportedBy', 'name email avatar');
    await bug.populate('assignedTo', 'name email avatar');

    await logActivity({
      user: req.user._id,
      action: 'reported_bug',
      details: `${req.user.name} reported bug "${bug.title}" in [${projectDoc.key}]`,
      entityType: 'bug',
      entityId: bug._id,
      project: projectDoc._id,
    });

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        title: 'Bug Assigned',
        message: `${req.user.name} assigned bug "${bug.title}" to you`,
        type: 'bug_assigned',
        link: `/bugs/${bug._id}`,
      });
    }

    return successResponse(res, 'Bug reported successfully', { bug }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bug
 * @route   PUT /api/bugs/:id
 * @access  Private
 */
const updateBug = async (req, res, next) => {
  try {
    let bug = await Bug.findById(req.params.id);
    if (!bug) {
      return errorResponse(res, 'Bug not found', 404);
    }
    const projectDoc = await Project.findById(bug.project).select('members manager');
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to update this bug', 403);
    }

    const {
      title,
      description,
      severity,
      priority,
      status,
      assignedTo,
      environment,
      stepsToReproduce,
      expectedResult,
      actualResult,
      resolutionNotes,
    } = req.body;

    const prevStatus = bug.status;

    // Developers can update status, steps, actual/expected, and resolution notes
    if (req.user.role === 'developer') {
      if (status) bug.status = status;
      if (resolutionNotes !== undefined) bug.resolutionNotes = resolutionNotes;
      if (actualResult !== undefined) bug.actualResult = actualResult;
      if (expectedResult !== undefined) bug.expectedResult = expectedResult;
    } else {
      // Admins and PMs can edit all fields
      if (title) bug.title = title;
      if (description) bug.description = description;
      if (severity) bug.severity = severity;
      if (priority) bug.priority = priority;
      if (status) bug.status = status;
      if (environment) bug.environment = environment;
      if (stepsToReproduce !== undefined) bug.stepsToReproduce = stepsToReproduce;
      if (expectedResult !== undefined) bug.expectedResult = expectedResult;
      if (actualResult !== undefined) bug.actualResult = actualResult;
      if (resolutionNotes !== undefined) bug.resolutionNotes = resolutionNotes;

      if (assignedTo !== undefined) {
        const prevAssignee = bug.assignedTo ? bug.assignedTo.toString() : null;
        bug.assignedTo = assignedTo || null;

        if (assignedTo && assignedTo.toString() !== prevAssignee) {
          await createNotification({
            recipient: assignedTo,
            sender: req.user._id,
            title: 'Bug Assigned',
            message: `${req.user.name} assigned bug "${bug.title}" to you`,
            type: 'bug_assigned',
            link: `/bugs/${bug._id}`,
          });
        }
      }
    }

    await bug.save();
    await bug.populate('project', 'name key');
    await bug.populate('reportedBy', 'name email avatar');
    await bug.populate('assignedTo', 'name email avatar');

    // Notify reporter on resolution or status update
    if (
      bug.reportedBy &&
      bug.reportedBy._id.toString() !== req.user._id.toString() &&
      prevStatus !== bug.status
    ) {
      await createNotification({
        recipient: bug.reportedBy._id,
        sender: req.user._id,
        title: 'Bug Status Updated',
        message: `Bug "${bug.title}" status changed to ${bug.status.toUpperCase()}`,
        type: 'status_changed',
        link: `/bugs/${bug._id}`,
      });
    }

    await logActivity({
      user: req.user._id,
      action: bug.status === 'resolved' ? 'resolved_bug' : 'updated_bug',
      details: `${req.user.name} updated bug "${bug.title}" (Status: ${bug.status})`,
      entityType: 'bug',
      entityId: bug._id,
      project: bug.project._id,
    });

    return successResponse(res, 'Bug updated successfully', { bug });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete bug
 * @route   DELETE /api/bugs/:id
 * @access  Private (Admin, Project Manager)
 */
const deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return errorResponse(res, 'Bug not found', 404);
    }
    const projectDoc = await Project.findById(bug.project).select('members manager');
    if (!canAccessProject(projectDoc, req.user)) {
      return errorResponse(res, 'Not authorized to delete this bug', 403);
    }

    await Comment.deleteMany({ entityType: 'bug', entityId: bug._id });
    await Bug.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user._id,
      action: 'deleted_bug',
      details: `${req.user.name} deleted bug "${bug.title}"`,
      entityType: 'bug',
      entityId: bug._id,
      project: bug.project,
    });

    return successResponse(res, 'Bug deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
};
