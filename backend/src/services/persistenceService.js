const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const dataDir = path.join(__dirname, '../../data');
const storeFilePath = path.join(dataDir, 'devtrack_store.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    logger.error('Failed to create data directory:', err.message);
  }
}

let saveTimeout = null;
let isSaving = false;

/**
 * Saves a full snapshot of all MongoDB collections to disk
 */
const saveDatabaseSnapshot = async () => {
  if (isSaving) return;
  isSaving = true;

  try {
    const [users, projects, tasks, bugs, comments, notifications, activityLogs] =
      await Promise.all([
        User.find().select('+password').lean(),
        Project.find().lean(),
        Task.find().lean(),
        Bug.find().lean(),
        Comment.find().lean(),
        Notification.find().lean(),
        ActivityLog.find().lean(),
      ]);

    const snapshot = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        projects: projects.length,
        tasks: tasks.length,
        bugs: bugs.length,
        comments: comments.length,
        notifications: notifications.length,
        activityLogs: activityLogs.length,
      },
      data: {
        users,
        projects,
        tasks,
        bugs,
        comments,
        notifications,
        activityLogs,
      },
    };

    // Write to a temp file first then atomic rename
    const tempPath = `${storeFilePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2), 'utf8');
    fs.renameSync(tempPath, storeFilePath);

    logger.info(
      `[Persistence] Saved snapshot to disk: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks, ${bugs.length} bugs`
    );
  } catch (err) {
    logger.error('[Persistence] Error saving database snapshot:', err.message);
  } finally {
    isSaving = false;
  }
};

/**
 * Schedules a debounced snapshot save (e.g. after database writes)
 */
const triggerDebouncedSave = (delayMs = 400) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDatabaseSnapshot();
  }, delayMs);
};

/**
 * Restores all MongoDB collections from disk snapshot if it exists
 */
const restoreDatabaseSnapshot = async () => {
  if (!fs.existsSync(storeFilePath)) {
    logger.info('[Persistence] No existing database snapshot found on disk.');
    return false;
  }

  try {
    const fileContent = fs.readFileSync(storeFilePath, 'utf8');
    if (!fileContent || fileContent.trim() === '') {
      return false;
    }

    const snapshot = JSON.parse(fileContent);
    const data = snapshot.data;

    if (!data || !Array.isArray(data.users) || data.users.length === 0) {
      logger.info('[Persistence] Snapshot is empty or invalid.');
      return false;
    }

    logger.info(`[Persistence] Restoring database from snapshot (${snapshot.timestamp})...`);

    // Clean existing collections to avoid duplicates
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Bug.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    // Restore collections
    if (data.users?.length) await User.insertMany(data.users, { ordered: false });
    if (data.projects?.length) await Project.insertMany(data.projects, { ordered: false });
    if (data.tasks?.length) await Task.insertMany(data.tasks, { ordered: false });
    if (data.bugs?.length) await Bug.insertMany(data.bugs, { ordered: false });
    if (data.comments?.length) await Comment.insertMany(data.comments, { ordered: false });
    if (data.notifications?.length) await Notification.insertMany(data.notifications, { ordered: false });
    if (data.activityLogs?.length) await ActivityLog.insertMany(data.activityLogs, { ordered: false });

    logger.info(
      `[Persistence] Successfully restored database: ${data.users.length} users, ${data.projects?.length || 0} projects, ${data.tasks?.length || 0} tasks, ${data.bugs?.length || 0} bugs`
    );

    return true;
  } catch (err) {
    logger.error('[Persistence] Error restoring database snapshot:', err.message);
    return false;
  }
};

/**
 * Attaches persistence hooks to Mongoose models
 */
const initPersistence = () => {
  const models = [User, Project, Task, Bug, Comment, Notification, ActivityLog];

  models.forEach((model) => {
    // Post-save hook (covers create and document update)
    model.schema.post('save', function () {
      triggerDebouncedSave();
    });

    // Post-remove/delete hooks
    model.schema.post('deleteOne', function () {
      triggerDebouncedSave();
    });
    model.schema.post('deleteMany', function () {
      triggerDebouncedSave();
    });
    model.schema.post('findOneAndDelete', function () {
      triggerDebouncedSave();
    });
    model.schema.post('findByIdAndDelete', function () {
      triggerDebouncedSave();
    });

    // Post-update hooks
    model.schema.post('updateOne', function () {
      triggerDebouncedSave();
    });
    model.schema.post('updateMany', function () {
      triggerDebouncedSave();
    });
    model.schema.post('findOneAndUpdate', function () {
      triggerDebouncedSave();
    });
    model.schema.post('findByIdAndUpdate', function () {
      triggerDebouncedSave();
    });
  });

  // Flush snapshot on process termination
  const flushAndExit = async () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    await saveDatabaseSnapshot();
  };

  process.once('beforeExit', flushAndExit);
};

module.exports = {
  saveDatabaseSnapshot,
  triggerDebouncedSave,
  restoreDatabaseSnapshot,
  initPersistence,
  storeFilePath,
};
