const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get activity logs stream
 * @route   GET /api/activity
 * @access  Private
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { project, entityType, limit = 50 } = req.query;
    let query = {};

    if (project && project !== 'all') {
      query.project = project;
    }

    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    // Role filtering for Developer
    if (req.user.role === 'developer' && !project) {
      const userProjects = await Project.find({
        $or: [{ members: req.user._id }, { manager: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.$or = [{ project: { $in: projectIds } }, { user: req.user._id }];
    }

    const activities = await ActivityLog.find(query)
      .populate('user', 'name email avatar role')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return successResponse(res, 'Activity logs fetched successfully', { activities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs };
