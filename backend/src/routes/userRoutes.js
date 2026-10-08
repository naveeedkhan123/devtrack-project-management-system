const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  uploadProfilePicture,
  removeProfilePicture,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadProfileImageMiddleware } = require('../middleware/upload');

// Profile picture endpoints (available to all authenticated roles)
router.patch('/profile-picture', protect, uploadProfileImageMiddleware, uploadProfilePicture);
router.post('/profile-picture', protect, uploadProfileImageMiddleware, uploadProfilePicture);
router.put('/profile-picture', protect, uploadProfileImageMiddleware, uploadProfilePicture);
router.delete('/profile-picture', protect, removeProfilePicture);

// Private for all logged in users
router.get('/', protect, getUsers);

// Admin-only user management endpoints
router.get('/admin', protect, authorize('admin'), getAdminUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
