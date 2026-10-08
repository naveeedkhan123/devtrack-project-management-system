const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get comments for task or bug
 * @route   GET /api/comments/:entityType/:entityId
 * @access  Private
 */
const getComments = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    if (!['task', 'bug'].includes(entityType)) {
      return errorResponse(res, 'Invalid entity type', 400);
    }

    const comments = await Comment.find({ entityType, entityId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });

    return successResponse(res, 'Comments fetched successfully', { comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to task or bug
 * @route   POST /api/comments
 * @access  Private
 */
const createComment = async (req, res, next) => {
  try {
    const { content, entityType, entityId } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Comment text cannot be empty', 400);
    }

    if (!['task', 'bug'].includes(entityType)) {
      return errorResponse(res, 'Invalid entity type', 400);
    }

    let targetDoc;
    let targetLink = '';
    let targetTitle = '';
    let recipientId = null;
    let projectId = null;

    if (entityType === 'task') {
      targetDoc = await Task.findById(entityId);
      if (!targetDoc) return errorResponse(res, 'Task not found', 404);
      targetTitle = targetDoc.title;
      targetLink = `/tasks/${targetDoc._id}`;
      recipientId = targetDoc.assignedTo;
      projectId = targetDoc.project;
      await Task.findByIdAndUpdate(entityId, { $inc: { commentsCount: 1 } });
    } else {
      targetDoc = await Bug.findById(entityId);
      if (!targetDoc) return errorResponse(res, 'Bug not found', 404);
      targetTitle = targetDoc.title;
      targetLink = `/bugs/${targetDoc._id}`;
      recipientId = targetDoc.assignedTo || targetDoc.reportedBy;
      projectId = targetDoc.project;
      await Bug.findByIdAndUpdate(entityId, { $inc: { commentsCount: 1 } });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      entityType,
      entityId,
    });

    await comment.populate('author', 'name email avatar role');

    await logActivity({
      user: req.user._id,
      action: 'added_comment',
      details: `${req.user.name} commented on ${entityType} "${targetTitle}"`,
      entityType,
      entityId,
      project: projectId,
    });

    if (recipientId && recipientId.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        title: `New Comment on ${entityType === 'task' ? 'Task' : 'Bug'}`,
        message: `${req.user.name}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
        type: 'comment_added',
        link: targetLink,
      });
    }

    return successResponse(res, 'Comment added successfully', { comment }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Author or Admin)
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    // Check authorization: must be author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to delete this comment', 403);
    }

    // Decrement count on target
    if (comment.entityType === 'task') {
      await Task.findByIdAndUpdate(comment.entityId, { $inc: { commentsCount: -1 } });
    } else {
      await Bug.findByIdAndUpdate(comment.entityId, { $inc: { commentsCount: -1 } });
    }

    await Comment.findByIdAndDelete(req.params.id);

    return successResponse(res, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
