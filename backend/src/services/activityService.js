const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Log an activity event to the database
 */
const logActivity = async ({ user, action, details, entityType, entityId = null, project = null }) => {
  try {
    if (!user || !action || !details || !entityType) {
      return null;
    }
    const log = await ActivityLog.create({
      user,
      action,
      details,
      entityType,
      entityId,
      project,
    });
    return log;
  } catch (error) {
    logger.error('Failed to record activity log:', error.message);
    return null;
  }
};

module.exports = { logActivity };
