const User = require('../models/User');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');

/**
 * @desc    Get team members directory with performance/workload metrics
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'active' })
      .select('-preferences -resetPasswordToken -resetPasswordExpire')
      .sort({ name: 1 });

    // Aggregate workload metrics for each team member
    const teamWithMetrics = await Promise.all(
      users.map(async (member) => {
        const [assignedTasks, completedTasks, openBugs, currentProjects] = await Promise.all([
          Task.countDocuments({ assignedTo: member._id }),
          Task.countDocuments({ assignedTo: member._id, status: 'completed' }),
          Bug.countDocuments({ assignedTo: member._id, status: { $in: ['open', 'in_progress', 'reopened'] } }),
          Project.countDocuments({ members: member._id, status: { $ne: 'completed' } }),
        ]);

        return {
          ...member.toObject(),
          stats: {
            assignedTasks,
            completedTasks,
            openBugs,
            currentProjects,
          },
        };
      })
    );

    return successResponse(res, 'Team members fetched successfully', { users: teamWithMetrics });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users for Admin User Management table
 * @route   GET /api/users/admin
 * @access  Private (Admin only)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return successResponse(res, 'Admin users fetched successfully', { users, total });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'project_manager', 'developer'].includes(role)) {
      return errorResponse(res, 'Invalid role specified', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) {
        return errorResponse(res, 'Cannot change role: System requires at least one active Admin', 400);
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity({
      user: req.user._id,
      action: 'updated_user_role',
      details: `Admin changed ${user.name}'s role from ${oldRole} to ${role}`,
      entityType: 'user',
      entityId: user._id,
    });

    return successResponse(res, `User role changed to ${role} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (active/inactive)
 * @route   PUT /api/users/:id/status
 * @access  Private (Admin only)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'You cannot deactivate your own account', 400);
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    await logActivity({
      user: req.user._id,
      action: 'toggled_user_status',
      details: `Admin ${user.status === 'active' ? 'activated' : 'deactivated'} account for ${user.name}`,
      entityType: 'user',
      entityId: user._id,
    });

    return successResponse(res, `User status updated to ${user.status}`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user._id,
      action: 'deleted_user',
      details: `Admin deleted user ${user.name} (${user.email})`,
      entityType: 'user',
      entityId: user._id,
    });

    return successResponse(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};
