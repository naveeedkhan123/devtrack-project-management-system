const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get dashboard metrics and charts data
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    let projectScopeQuery = {};

    // For developer, calculate metrics across assigned/joined projects
    if (req.user.role === 'developer') {
      const userProjects = await Project.find({
        $or: [{ members: req.user._id }, { manager: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectScopeQuery = { project: { $in: projectIds } };
    }

    // High level KPI counts
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      openBugs,
      resolvedBugs,
    ] = await Promise.all([
      Project.countDocuments(req.user.role === 'developer' ? { members: req.user._id } : {}),
      Project.countDocuments(
        req.user.role === 'developer'
          ? { members: req.user._id, status: 'active' }
          : { status: 'active' }
      ),
      Project.countDocuments(
        req.user.role === 'developer'
          ? { members: req.user._id, status: 'completed' }
          : { status: 'completed' }
      ),
      Task.countDocuments(projectScopeQuery),
      Task.countDocuments({ ...projectScopeQuery, status: 'completed' }),
      Task.countDocuments({
        ...projectScopeQuery,
        status: { $in: ['todo', 'in_progress', 'review'] },
      }),
      Bug.countDocuments({
        ...projectScopeQuery,
        status: { $in: ['open', 'in_progress', 'reopened'] },
      }),
      Bug.countDocuments({
        ...projectScopeQuery,
        status: { $in: ['resolved', 'closed'] },
      }),
    ]);

    // Tasks by status for breakdown chart
    const tasksByStatus = await Task.aggregate([
      { $match: projectScopeQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Tasks by priority for chart
    const tasksByPriority = await Task.aggregate([
      { $match: projectScopeQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Bugs by severity for chart
    const bugsBySeverity = await Bug.aggregate([
      { $match: projectScopeQuery },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Bugs by status for chart
    const bugsByStatus = await Bug.aggregate([
      { $match: projectScopeQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent activity stream
    const recentActivity = await ActivityLog.find(
      req.user.role === 'developer' ? { ...projectScopeQuery } : {}
    )
      .populate('user', 'name email avatar role')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(8);

    // Upcoming deadlines (Tasks & Projects due in upcoming days)
    const upcomingTasks = await Task.find({
      ...projectScopeQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() },
    })
      .populate('project', 'name key')
      .populate('assignedTo', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(6);

    // Recently assigned tasks for current user
    const recentlyAssigned = await Task.find({
      assignedTo: req.user._id,
      status: { $ne: 'completed' },
    })
      .populate('project', 'name key')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Project progress breakdown for chart
    const topProjects = await Project.find(
      req.user.role === 'developer' ? { members: req.user._id } : {}
    )
      .sort({ updatedAt: -1 })
      .limit(6);

    const projectProgressList = await Promise.all(
      topProjects.map(async (p) => {
        const [totalT, doneT] = await Promise.all([
          Task.countDocuments({ project: p._id }),
          Task.countDocuments({ project: p._id, status: 'completed' }),
        ]);
        const progress = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;
        return {
          id: p._id,
          name: p.name,
          key: p.key,
          status: p.status,
          totalTasks: totalT,
          completedTasks: doneT,
          progress,
        };
      })
    );

    return successResponse(res, 'Dashboard statistics fetched successfully', {
      kpi: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        completedTasks,
        openBugs,
        resolvedBugs,
      },
      charts: {
        tasksByStatus,
        tasksByPriority,
        bugsBySeverity,
        bugsByStatus,
        projectProgress: projectProgressList,
      },
      recentActivity,
      upcomingTasks,
      recentlyAssigned,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system overview for Admin
 * @route   GET /api/system/overview
 * @access  Private (Admin only)
 */
const getSystemOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      admins,
      projectManagers,
      developers,
      activeUsers,
      inactiveUsers,
      totalProjects,
      totalTasks,
      totalBugs,
      totalComments,
      totalActivityLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'project_manager' }),
      User.countDocuments({ role: 'developer' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      Project.countDocuments(),
      Task.countDocuments(),
      Bug.countDocuments(),
      require('../models/Comment').countDocuments(),
      ActivityLog.countDocuments(),
    ]);

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      databaseState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    };

    return successResponse(res, 'System overview fetched successfully', {
      stats: {
        totalUsers,
        roleBreakdown: {
          admins,
          projectManagers,
          developers,
        },
        userStatus: {
          activeUsers,
          inactiveUsers,
        },
        entities: {
          totalProjects,
          totalTasks,
          totalBugs,
          totalComments,
          totalActivityLogs,
        },
      },
      systemInfo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSystemOverview,
};
