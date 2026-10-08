const Bug = require('../models/Bug');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all bugs with filters
 * @route   GET /api/bugs
 * @access  Private
 */
const getBugs = async (req, res, next) => {
  try {
    const { project, status, severity, priority, assignedTo, search } = req.query;
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

    // Developer role restriction if no specific project specified
    if (req.user.role === 'developer' && !project) {
      const userProjects = await Project.find({
        $or: [{ members: req.user._id }, { manager: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.project = { $in: projectIds };
    }

    if (search) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { environment: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const bugs = await Bug.find(query)
      .populate('project', 'name key status')
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar role')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Bugs fetched successfully', { bugs, total: bugs.length });
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
