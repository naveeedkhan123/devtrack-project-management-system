const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const { isValidObjectId } = require('mongoose');
      return isValidObjectId(val);
    })
    .withMessage('Invalid assigned user ID'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid due date format'),
];

const updateTaskStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('Order must be a number'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
};
