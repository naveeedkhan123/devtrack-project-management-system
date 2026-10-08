const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: {
        values: ['task', 'bug'],
        message: '{VALUE} is not a valid entity type for comment',
      },
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying comments on a task/bug
CommentSchema.index({ entityType: 1, entityId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
