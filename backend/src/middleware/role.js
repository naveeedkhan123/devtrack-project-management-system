const { errorResponse } = require('../utils/apiResponse');

/**
 * Grant access to specific user roles
 * @param  {...string} roles Allowed roles ('admin', 'project_manager', 'developer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role '${req.user.role}' is not authorized to perform this action. Required: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
