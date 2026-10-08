const { body } = require('express-validator');

const createBugValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Bug title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Bug title must be between 2 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Bug description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed', 'reopened'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid assigned developer ID'),
  body('environment')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Environment string cannot exceed 50 characters'),
  body('stepsToReproduce')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Steps to reproduce cannot exceed 5000 characters'),
];

const updateBugValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Bug title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed', 'reopened'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const { isValidObjectId } = require('mongoose');
      return isValidObjectId(val);
    })
    .withMessage('Invalid assigned developer ID'),
  body('resolutionNotes')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Resolution notes cannot exceed 5000 characters'),
];

module.exports = {
  createBugValidator,
  updateBugValidator,
};
