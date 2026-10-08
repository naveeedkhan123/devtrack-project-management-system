const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSystemOverview,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/overview', authorize('admin'), getSystemOverview);

module.exports = router;
