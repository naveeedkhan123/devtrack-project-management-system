const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes - JWT verification middleware
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User no longer exists', 401);
    }

    if (user.status === 'inactive') {
      return errorResponse(res, 'Account is deactivated. Please contact an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Not authorized to access this route, invalid or expired token', 401);
  }
};

module.exports = { protect };
