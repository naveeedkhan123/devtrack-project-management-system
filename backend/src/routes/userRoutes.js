const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Private for all logged in users
router.get('/', protect, getUsers);

// Admin-only user management endpoints
router.get('/admin', protect, authorize('admin'), getAdminUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
