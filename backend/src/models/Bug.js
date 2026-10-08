const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a bug title'],
      trim: true,
      maxlength: [200, 'Bug title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a bug description'],
      maxlength: [5000, 'Bug description cannot exceed 5000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Please specify the project'],
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'medium',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
        message: '{VALUE} is not a valid bug status',
      },
      default: 'open',
      index: true,
    },
    environment: {
      type: String,
      default: 'Production',
      trim: true,
    },
    stepsToReproduce: {
      type: String,
      default: '',
    },
    expectedResult: {
      type: String,
      default: '',
    },
    actualResult: {
      type: String,
      default: '',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common dashboard and bug filters
BugSchema.index({ project: 1, status: 1 });
BugSchema.index({ project: 1, severity: 1 });

module.exports = mongoose.model('Bug', BugSchema);
