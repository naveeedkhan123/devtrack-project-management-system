const { body } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Project key is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Project key must be between 2 and 10 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Project key can only contain letters, numbers, hyphens, and underscores'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed'])
    .withMessage('Invalid status'),
  body('manager')
    .notEmpty()
    .withMessage('Project manager is required')
    .isMongoId()
    .withMessage('Invalid manager ID'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid deadline date format'),
];

const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed'])
    .withMessage('Invalid status'),
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid deadline date format'),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
};
