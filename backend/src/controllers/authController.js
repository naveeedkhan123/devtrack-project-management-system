const crypto = require('crypto');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'An account with this email address already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'developer',
    });

    const token = user.getSignedJwtToken();

    await logActivity({
      user: user._id,
      action: 'registered_account',
      details: `${user.name} registered as ${user.role}`,
      entityType: 'user',
      entityId: user._id,
    });

    return successResponse(
      res,
      'Registration successful',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          profilePicture: user.profilePicture,
          bio: user.bio,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (user.status === 'inactive') {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = user.getSignedJwtToken();

    return successResponse(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profilePicture: user.profilePicture,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 'User profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, profilePicture, preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();

    await logActivity({
      user: user._id,
      action: 'updated_profile',
      details: `${user.name} updated their profile settings`,
      entityType: 'user',
      entityId: user._id,
    });

    return successResponse(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    return successResponse(res, 'Password changed successfully', { token });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return errorResponse(
        res,
        'Password reset is not configured. Please contact your administrator.',
        503
      );
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 for security so attackers cannot enumerate valid emails
      return successResponse(
        res,
        'If an account with that email exists, password reset instructions have been generated.'
      );
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    return successResponse(
      res,
      'Password reset token generated successfully',
      {
        resetToken, // Returned for dev/demo testing convenience
        message: 'Use this reset token to change your password',
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired password reset token', 400);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    return successResponse(res, 'Password reset successful', { token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
